/**
 * @repo/database
 *
 * Prisma database client and types for Broom Kit monorepo.
 *
 * @example
 * ```ts
 * import { prisma } from "@repo/database";
 *
 * const users = await prisma.user.findMany();
 * ```
 */

export { prisma, disconnect, healthCheck } from './client';

export { prisma as db } from './client';

export {
  Prisma,
  PrismaClient,
  UserRole,
  NotificationType,
} from './generated/prisma/client';

export type {
  User,
  Account,
  Session,
  VerificationToken,
  Notification,
} from './generated/prisma/client';
