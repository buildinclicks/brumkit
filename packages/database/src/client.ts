/**
 * Prisma Client Singleton
 *
 * Ensures only one instance of Prisma Client exists across the application.
 * Handles Hot Module Replacement (HMR) in development.
 * Lazy-initialized so importing @repo/database types does not require DATABASE_URL.
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });
};

let _prisma: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = global.prisma ?? prismaClientSingleton();
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = _prisma;
    }
  }
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrisma();
    const value = client[prop as keyof PrismaClient];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export async function disconnect() {
  const client = _prisma ?? global.prisma;
  if (client) {
    await client.$disconnect();
    _prisma = undefined;
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = undefined;
    }
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}
