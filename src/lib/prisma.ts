import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Enable WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  const databaseUrl = process.env.DATABASE_URL;

  // Only use Neon adapter in production (Vercel/serverless)
  // In development, use standard PrismaClient for better performance
  if (process.env.NODE_ENV === 'production' && databaseUrl && databaseUrl.includes('neon.tech')) {
    console.log('[Prisma] Using Neon adapter for production (DATABASE_URL found)');
    try {
      const pool = new Pool({ connectionString: databaseUrl } as any);
      const adapter = new PrismaNeon(pool as any);
      const client = new PrismaClient({
        adapter,
        log: ['error', 'warn'],
      });
      console.log('[Prisma] Neon adapter PrismaClient created successfully');
      return client;
    } catch (error) {
      console.error('[Prisma] CRITICAL: Failed to initialize Neon adapter:', error);
    }
  }

  // Use standard PrismaClient for local development or fallback
  console.log('[Prisma] Using standard PrismaClient strategy');
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error', 'warn'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
