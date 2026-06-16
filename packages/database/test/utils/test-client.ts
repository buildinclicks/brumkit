/**
 * Test Database Client
 *
 * Provides a separate Prisma client instance for testing.
 * Uses test database URL and handles cleanup between tests.
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/generated/prisma/client';

const DEFAULT_TEST_DATABASE_URL =
  'postgresql://postgres:postgres@127.0.0.1:5433/broom_kit_test';

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || DEFAULT_TEST_DATABASE_URL;

let testPrisma: PrismaClient | null = null;

export function getTestClient(): PrismaClient {
  if (!testPrisma) {
    const adapter = new PrismaPg({ connectionString: TEST_DATABASE_URL });
    testPrisma = new PrismaClient({
      adapter,
      log: process.env.DEBUG_TESTS ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return testPrisma;
}

export async function disconnectTestClient() {
  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = null;
  }
}

export async function cleanDatabase() {
  const client = getTestClient();

  await client.$transaction([
    client.notification.deleteMany(),
    client.session.deleteMany(),
    client.account.deleteMany(),
    client.verificationToken.deleteMany(),
    client.user.deleteMany(),
  ]);
}

export async function resetTestDatabase() {
  await cleanDatabase();
}
