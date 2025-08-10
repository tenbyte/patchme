import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logSystemActivity } from "@/lib/activitylog"

// Advanced Rate Limiting 
class InMemoryRateLimit {
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>()
  private cleanupInterval: NodeJS.Timeout
  
  constructor(
    private readonly windowMs = 60 * 1000, // 1 minute
    private readonly maxRequests = 100,     // Max requests per window
    private readonly cleanupIntervalMs = 5 * 60 * 1000 // Cleanup every 5 minutes
  ) {
    // Automatic cleanup of old entries
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, this.cleanupIntervalMs)
  }
  
  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const limit = this.rateLimitMap.get(key)
    
    if (!limit || now > limit.resetTime) {
      const resetTime = now + this.windowMs
      this.rateLimitMap.set(key, { count: 1, resetTime })
      return { allowed: true, remaining: this.maxRequests - 1, resetTime }
    }
    
    if (limit.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: limit.resetTime }
    }
    
    limit.count++
    return { 
      allowed: true, 
      remaining: this.maxRequests - limit.count, 
      resetTime: limit.resetTime 
    }
  }
  
  private cleanup() {
    const now = Date.now()
    for (const [key, limit] of this.rateLimitMap.entries()) {
      if (now > limit.resetTime) {
        this.rateLimitMap.delete(key)
      }
    }
  }
  
  // Cleanup on process end
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Rate limiter instance
const rateLimiter = new InMemoryRateLimit(
  60 * 1000,  // 1 minute window
  100         // Max 100 requests per minute per API key
)

// Graceful shutdown
process.on('SIGTERM', () => {
  rateLimiter.destroy()
})

// Safe JSON parser with detailed error logging
async function safeParseJSON(req: NextRequest): Promise<{ success: true; data: any } | { success: false; error: string; rawBody: string }> {
  try {
    const rawBody = await req.text()
    
    // Log raw body for debugging (truncated for security)
    console.log('Raw request body (first 500 chars):', rawBody.substring(0, 500))
    
    // Check for common control characters that break JSON
    const controlChars = rawBody.match(/[\x00-\x1F\x7F]/g)
    // if (controlChars) {
    //   console.log('Found control characters:', controlChars.map(c => `\\x${c.charCodeAt(0).toString(16).padStart(2, '0')}`))
    // }
    
    // Try to clean the JSON string
    const cleanedBody = rawBody
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars except \t, \n, \r
      .trim()
    
    if (cleanedBody !== rawBody) {
      console.log('Cleaned JSON body (removed control characters)')
    }
    
    const parsedData = JSON.parse(cleanedBody)
    return { success: true, data: parsedData }
    
  } catch (error) {
    const rawBody = await req.text().catch(() => '[Could not read body]')
    
    console.error('JSON Parse Error Details:', {
      error: error instanceof Error ? error.message : String(error),
      bodyLength: rawBody.length,
      bodyPreview: rawBody.substring(0, 200),
      contentType: req.headers.get('content-type'),
      userAgent: req.headers.get('user-agent'),
      position: error instanceof SyntaxError ? extractPositionFromError(error.message) : null
    })
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown JSON parse error',
      rawBody: rawBody.substring(0, 500) // Truncate for security
    }
  }
}

// Extract position information from JSON parse error
function extractPositionFromError(errorMessage: string): { position?: number; line?: number; column?: number } | null {
  const positionMatch = errorMessage.match(/position (\d+)/)
  const lineColumnMatch = errorMessage.match(/line (\d+) column (\d+)/)
  
  return {
    position: positionMatch ? parseInt(positionMatch[1]) : undefined,
    line: lineColumnMatch ? parseInt(lineColumnMatch[1]) : undefined,
    column: lineColumnMatch ? parseInt(lineColumnMatch[2]) : undefined
  }
}

// Retry wrapper for database operations with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // MySQL Optimistic Locking Error (Record has changed)
      if (error.code === 'P2034' || 
          (error.message && error.message.includes('Record has changed since last read'))) {
        
        if (attempt < maxRetries) {
          // Exponential backoff with jitter
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
      
      // For other errors, don't retry
      throw error
    }
  }
  
  throw lastError
}

export async function POST(req: NextRequest) {
  try {
    // Safe JSON parsing with detailed error logging
    const parseResult = await safeParseJSON(req)
    
    if (!parseResult.success) {
      console.error('Failed to parse JSON request:', parseResult.error)
      return NextResponse.json({ 
        error: "Invalid JSON format", 
        details: parseResult.error,
        hint: "Check for control characters or invalid JSON syntax"
      }, { status: 400 })
    }
    
    const { key, versions } = parseResult.data
    
    if (!key || !Array.isArray(versions)) {
      console.error('Invalid request structure:', { hasKey: !!key, versionsType: typeof versions, versionsIsArray: Array.isArray(versions) })
      return NextResponse.json({ error: "Missing key or versions array." }, { status: 400 })
    }

    // Validate versions array structure
    const invalidVersions = versions.filter(v => !v || typeof v.variable !== 'string' || typeof v.version !== 'string')
    if (invalidVersions.length > 0) {
      console.error('Invalid version entries:', invalidVersions)
      return NextResponse.json({ 
        error: "Invalid version entries. Each version must have 'variable' and 'version' strings.",
        invalidEntries: invalidVersions.length
      }, { status: 400 })
    }

    // Check rate limiting
    const rateLimit = rateLimiter.check(key)
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        error: "Rate limit exceeded. Try again later.",
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
        }
      })
    }

    // Find system (without include for better performance)
    const system = await prisma.system.findFirst({ 
      where: { apiKey: key },
      select: { id: true, name: true }
    })
    
    if (!system) {
      console.error('Invalid API key used:', key.substring(0, 8) + '...')
      return NextResponse.json({ error: "Invalid API key." }, { status: 401 })
    }

    console.log(`Processing ingest for system ${system.name} (${system.id}) with ${versions.length} versions`)

    // Load all baselines once
    const baselines = await prisma.baseline.findMany({
      where: { variable: { in: versions.map(v => v.variable) } },
      select: { id: true, variable: true }
    })
    
    const baselineMap = new Map(baselines.map(b => [b.variable, b.id]))

    // Transaction with retry logic for high concurrency scenarios
    await withRetry(async () => {
      return await prisma.$transaction(async (tx) => {
        // Batch upsert for better performance
        const upsertPromises = versions
          .filter(entry => baselineMap.has(entry.variable))
          .map(entry => {
            const baselineId = baselineMap.get(entry.variable)!
            return tx.systemBaselineValue.upsert({
              where: { 
                systemId_baselineId: { 
                  systemId: system.id, 
                  baselineId: baselineId 
                } 
              },
              update: { value: entry.version },
              create: {
                systemId: system.id,
                baselineId: baselineId,
                value: entry.version,
              },
            })
          })

        await Promise.all(upsertPromises)

        // Update lastSeen with fresh read to avoid stale data
        await tx.system.update({ 
          where: { id: system.id }, 
          data: { lastSeen: new Date() } 
        })
      }, {
        maxWait: 5000, // Max 5 seconds wait for transaction
        timeout: 10000, // Max 10 seconds for transaction
        isolationLevel: 'ReadCommitted' // Use READ COMMITTED to reduce lock contention
      })
    }, 3, 100) // Retry up to 3 times with exponential backoff

    // ActivityLog outside transaction (not critical for consistency)
    try {
      await logSystemActivity({ 
        systemId: system.id, 
        action: "ingest", 
        meta: { versions } 
      })
    } catch (logError) {
      // Don't throw log errors as main operation was successful
      console.error('ActivityLog failed:', logError)
    }

    const processed = versions.filter(entry => baselineMap.has(entry.variable)).length
    const skipped = versions.length - processed

    console.log(`Ingest completed for system ${system.name}: ${processed} processed, ${skipped} skipped`)

    return NextResponse.json({ 
      ok: true,
      processed,
      skipped
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
      }
    })
  } catch (e: any) {
    console.error('Ingest error:', {
      message: e.message,
      code: e.code,
      stack: e.stack?.split('\n').slice(0, 5), // First 5 lines of stack trace
      headers: {
        'content-type': req.headers.get('content-type'),
        'user-agent': req.headers.get('user-agent'),
        'content-length': req.headers.get('content-length')
      }
    })
    
    // Special handling for known DB conflicts
    if (e.code === 'P2002') {
      return NextResponse.json({ error: "Conflict detected. Please retry." }, { status: 409 })
    }
    
    // Optimistic locking conflicts after retries
    if (e.code === 'P2034' || (e.message && e.message.includes('Record has changed since last read'))) {
      return NextResponse.json({ 
        error: "High concurrency detected. Please retry with backoff." 
      }, { status: 409 })
    }
    
    // Timeout errors
    if (e.code === 'P2024') {
      return NextResponse.json({ error: "Database timeout. Please retry." }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: e.message || "Failed to ingest data." 
    }, { status: 500 })
  }
}
