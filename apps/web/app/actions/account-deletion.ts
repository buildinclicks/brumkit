'use server';

import { auth, verifyPassword } from '@repo/auth';
import { prisma } from '@repo/database';
import { sendAccountDeletionNotification } from '@repo/email';
import { RedisRateLimiter } from '@repo/rate-limit';
import {
  deleteAccountSchema,
  type DeleteAccountInput,
  ValidationMessages,
  zodErrorToObject,
} from '@repo/validation';

import type { ActionResult } from './auth';

/**
 * Server action to delete user account (soft delete with 30-day grace period)
 * Requires password confirmation for security
 */
export async function deleteAccount(
  data: DeleteAccountInput
): Promise<ActionResult> {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'You must be authenticated to delete your account.',
      };
    }

    // 2. Validate input
    const validatedData = deleteAccountSchema.safeParse(data);
    if (!validatedData.success) {
      const fieldErrors = zodErrorToObject(validatedData.error);
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors,
      };
    }

    // 3. Rate limiting (3 attempts per hour)
    const rateLimiter = new RedisRateLimiter();

    try {
      const rateLimitResult = await rateLimiter.check({
        action: 'account-deletion',
        identifier: session.user.id,
        limit: 3,
        window: 3600, // 1 hour
      });

      if (!rateLimitResult.success) {
        const minutes = Math.ceil((rateLimitResult.retryAfter || 0) / 60);
        const timeUnit = minutes >= 60 ? 'hour' : `${minutes} minutes`;
        return {
          success: false,
          error: `Too many deletion attempts. Please try again in ${timeUnit}.`,
        };
      }
    } catch (rateLimitError) {
      // Fail-open: allow request if rate limiter fails
      console.error('Rate limiter error:', rateLimitError);
    }

    // 4. Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isDeleted: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found.',
      };
    }

    // 5. Check if already deleted
    if (user.isDeleted) {
      return {
        success: false,
        error: 'This account has already been deleted.',
      };
    }

    // 6. Check if user has password (OAuth-only users can't delete via password)
    if (!user.password) {
      return {
        success: false,
        error:
          'Cannot delete account. Please contact support for OAuth-based accounts.',
      };
    }

    // 7. Verify password
    const isPasswordValid = await verifyPassword(
      validatedData.data.password,
      user.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'auth.delete_account.error_title',
        fieldErrors: {
          password: ValidationMessages.PASSWORD_INCORRECT,
        },
      };
    }

    // 8. Soft delete user (set deletedAt timestamp and isDeleted flag)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // 9. Invalidate all user sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // 10. Send deletion notification email (fire and forget)
    try {
      await sendAccountDeletionNotification({
        email: user.email,
        userName: user.name || 'User',
      });
    } catch (emailError) {
      // Log but don't fail the request (account is already deleted)
      console.error('Error sending account deletion notification:', emailError);
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error deleting account:', error);
    return {
      success: false,
      error: 'Failed to delete account. Please try again later.',
    };
  }
}
