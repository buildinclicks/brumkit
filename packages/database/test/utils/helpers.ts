/**
 * Database Test Helpers
 *
 * Higher-level helpers for database testing.
 * Combines fixtures with Prisma operations.
 */

import { getTestClient } from './test-client';
import {
  createUserWithPasswordFixture,
  createNotificationFixture,
} from '../fixtures';
import type { User, Notification, Prisma } from '@repo/database';

const db = getTestClient();

/**
 * Create and insert a test user
 */
export async function createTestUser(
  overrides?: Partial<Prisma.UserCreateInput>
): Promise<User> {
  const userData = await createUserWithPasswordFixture(
    'Password123!',
    overrides
  );
  return db.user.create({ data: userData });
}

/**
 * Create and insert multiple test users
 */
export async function createTestUsers(count: number): Promise<User[]> {
  const usersData = await Promise.all(
    Array.from({ length: count }, () => createUserWithPasswordFixture())
  );

  return Promise.all(usersData.map((data) => db.user.create({ data })));
}

/**
 * Get user by email (common test operation)
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({ where: { email } });
}

/**
 * Count records in a table (useful for assertions)
 */
export async function countUsers(): Promise<number> {
  return db.user.count();
}

/**
 * Create and insert a test notification
 */
export async function createTestNotification(
  data: Partial<Prisma.NotificationCreateInput> & { recipientId: string }
): Promise<Notification> {
  const { recipientId, ...rest } = data;
  const notificationData = createNotificationFixture(recipientId, 'SYSTEM', {
    ...rest,
    recipient: { connect: { id: recipientId } },
  });

  return db.notification.create({
    data: notificationData,
  });
}
