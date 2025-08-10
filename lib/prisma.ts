import { PrismaClient, Prisma } from "./generated/prisma/client"

// Connection Pool configuration based on environment
const getDatabaseConfig = (): Prisma.PrismaClientOptions => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === undefined
  
  const baseConfig: Prisma.PrismaClientOptions = {
    datasources: {
      db: {
        // Fallback URL for build-time when DATABASE_URL is not available
        url: process.env.DATABASE_URL || "mysql://build:build@localhost:3306/build"
      }
    },
    // Only log errors by default, disable query logging
    log: ['error'],
  }

  // In Production: Extended pool configuration
  if (isProduction) {
    return {
      ...baseConfig,
      // Connection Pool Settings for high concurrency
      __internal: {
        engine: {
          // Max number of DB connections per Prisma Client
          connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '50'),
          // Timeout for new connections (ms)
          poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '10000'),
          // Idle Timeout - how long connections stay open (ms)
          idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '300000'),
        },
      },
    } as Prisma.PrismaClientOptions
  }

  return baseConfig
}

// Singleton Pattern for Prisma Client
class PrismaManager {
  private static instance: PrismaClient | null = null
  
  static getInstance(): PrismaClient {
    if (!PrismaManager.instance) {
      PrismaManager.instance = new PrismaClient(getDatabaseConfig())
      
      // Graceful Shutdown Handler
      const cleanup = async () => {
        if (PrismaManager.instance) {
          await PrismaManager.instance.$disconnect()
          PrismaManager.instance = null
        }
      }
      
      process.on('SIGTERM', cleanup)
      process.on('SIGINT', cleanup)
      process.on('beforeExit', cleanup)
    }
    
    return PrismaManager.instance
  }
  
  // For tests: reset connection
  static async reset() {
    if (PrismaManager.instance) {
      await PrismaManager.instance.$disconnect()
      PrismaManager.instance = null
    }
  }
}

// Global for Development (prevents Hot Reload issues)
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === undefined) {
  prisma = PrismaManager.getInstance()
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = PrismaManager.getInstance()
  }
  prisma = (global as any).prisma
}

export { prisma, PrismaManager }