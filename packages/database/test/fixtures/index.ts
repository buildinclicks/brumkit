/**
 * Test Fixtures
 *
 * Factory functions for creating test data with sensible defaults.
 * Uses @faker-js/faker for realistic data generation.
 */

import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';
import type { Prisma, NotificationType } from '@repo/database';

/**
 * Generate a test user
 */
export function createUserFixture(
  overrides?: Partial<Prisma.UserCreateInput>
): Prisma.UserCreateInput {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = faker.internet
    .username({ firstName, lastName })
    .toLowerCase();

  return {
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    name: `${firstName} ${lastName}`,
    username,
    emailVerified: faker.datatype.boolean() ? faker.date.past() : null,
    image: faker.image.avatar(),
    bio: faker.lorem.sentence(),
    role: 'USER',
    ...overrides,
  };
}

/**
 * Generate a test user with hashed password
 */
export async function createUserWithPasswordFixture(
  password: string = 'Password123!',
  overrides?: Partial<Prisma.UserCreateInput>
): Promise<Prisma.UserCreateInput> {
  const hashedPassword = await hash(password, 10);
  return createUserFixture({
    ...overrides,
    password: hashedPassword,
  });
}

/**
 * Generate a test notification
 */
export function createNotificationFixture(
  recipientId: string,
  type: NotificationType = 'SYSTEM',
  overrides?: Partial<Prisma.NotificationCreateInput>
): Prisma.NotificationCreateInput {
  return {
    type,
    title: faker.lorem.sentence(),
    message: faker.lorem.paragraph(),
    recipient: { connect: { id: recipientId } },
    ...overrides,
  };
}

/**
 * Seed helper: Create multiple users
 */
export async function createUsers(
  count: number,
  overrides?: Partial<Prisma.UserCreateInput>
): Promise<Prisma.UserCreateInput[]> {
  return Promise.all(
    Array.from({ length: count }, () =>
      createUserWithPasswordFixture('Password123!', overrides)
    )
  );
}
