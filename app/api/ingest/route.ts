import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logSystemActivity } from "@/lib/activitylog"

class InMemoryRateLimit {
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>()
  private cleanupInterval: NodeJS.Timeout
  
  constructor(
    private readonly windowMs = 60 * 1000,
    private readonly maxRequests = 100,
    private readonly cleanupIntervalMs = 5 * 60 * 1000
  ) {
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
  
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

const rateLimiter = new InMemoryRateLimit(
  60 * 1000,  // 1 minute
  100         // Max 100 requests per min
)

process.on('SIGTERM', () => {
  rateLimiter.destroy()
})

async function safeParseJSON(req: NextRequest): Promise<{ success: true; data: any } | { success: false; error: string; rawBody: string }> {
  try {
    const rawBody = await req.text()
    const controlChars = rawBody.match(/[\x00-\x1F\x7F]/g)
    // if (controlChars) {
    //   console.log('Found control characters:', controlChars.map(c => `\\x${c.charCodeAt(0).toString(16).padStart(2, '0')}`))
    // }
    
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
      rawBody: rawBody.substring(0, 500)
    }
  }
}

function extractPositionFromError(errorMessage: string): { position?: number; line?: number; column?: number } | null {
  const positionMatch = errorMessage.match(/position (\d+)/)
  const lineColumnMatch = errorMessage.match(/line (\d+) column (\d+)/)
  
  return {
    position: positionMatch ? parseInt(positionMatch[1]) : undefined,
    line: lineColumnMatch ? parseInt(lineColumnMatch[1]) : undefined,
    column: lineColumnMatch ? parseInt(lineColumnMatch[2]) : undefined
  }
}

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
      
      if (error.code === 'P2034' || 
          (error.message && error.message.includes('Record has changed since last read'))) {
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
      
      throw error
    }
  }
  
  throw lastError
}

export async function POST(req: NextRequest) {
  try {
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

    const invalidVersions = versions.filter(v => !v || typeof v.variable !== 'string' || typeof v.version !== 'string')
    if (invalidVersions.length > 0) {
      console.error('Invalid version entries:', invalidVersions)
      return NextResponse.json({ 
        error: "Invalid version entries. Each version must have 'variable' and 'version' strings.",
        invalidEntries: invalidVersions.length
      }, { status: 400 })
    }

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

    const system = await prisma.system.findFirst({ 
      where: { apiKey: key },
      select: { id: true, name: true }
    })
    
    if (!system) {
      console.error('Invalid API key used:', key.substring(0, 8) + '...')
      return NextResponse.json({ error: "Invalid API key." }, { status: 401 })
    }

    console.log(`Processing ingest for system ${system.name} (${system.id}) with ${versions.length} versions`)

    const baselines = await prisma.baseline.findMany({
      where: { variable: { in: versions.map(v => v.variable) } },
      select: { id: true, variable: true }
    })
    
    const baselineMap = new Map(baselines.map(b => [b.variable, b.id]))

    await withRetry(async () => {
      return await prisma.$transaction(async (tx) => {
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

        await tx.system.update({ 
          where: { id: system.id }, 
          data: { lastSeen: new Date() } 
        })
      }, {
        maxWait: 5000, 
        timeout: 10000, 
        isolationLevel: 'ReadCommitted'
      })
    }, 3, 100)

    try {
      await logSystemActivity({ 
        systemId: system.id, 
        action: "ingest", 
        meta: { versions } 
      })
    } catch (logError) {
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
      stack: e.stack?.split('\n').slice(0, 5),
      headers: {
        'content-type': req.headers.get('content-type'),
        'user-agent': req.headers.get('user-agent'),
        'content-length': req.headers.get('content-length')
      }
    })
    
    if (e.code === 'P2002') {
      return NextResponse.json({ error: "Conflict detected. Please retry." }, { status: 409 })
    }
    
    if (e.code === 'P2034' || (e.message && e.message.includes('Record has changed since last read'))) {
      return NextResponse.json({ 
        error: "High concurrency detected. Please retry with backoff." 
      }, { status: 409 })
    }
    
    if (e.code === 'P2024') {
      return NextResponse.json({ error: "Database timeout. Please retry." }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: e.message || "Failed to ingest data." 
    }, { status: 500 })
  }
}
