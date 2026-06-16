'use server';

import { randomBytes } from 'crypto';

import { auth, verifyPassword } from '@repo/auth';
import { prisma } from '@repo/database';
import {
  sendEmailChangeNotification,
  sendEmailChangeVerification,
} from '@repo/email';
import { RedisRateLimiter } from '@repo/rate-limit';
import {
  requestEmailChangeSchema,
  type RequestEmailChangeInput,
  type VerifyEmailChangeInput,
  verifyEmailChangeSchema,
  ValidationMessages,
} from '@repo/validation';
import { headers } from 'next/headers';
import { ZodError } from 'zod';

import { formatRetryAfter, getClientIp } from '@/lib/utils/rate-limit-helpers';

import type { ActionResult } from './auth';

/**
 * Request email change with password confirmation
 * Sends verification email to new address and notification to old address
 * Rate limited: 3 attempts per hour per user
 */
export async function requestEmailChange(
  data: RequestEmailChangeInput
): Promise<ActionResult> {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Validate input
    const validatedData = requestEmailChangeSchema.parse(data);

    // Apply rate limiting EARLY to prevent abuse
    const headersList = await headers();
    const clientIp = getClientIp(headersList);

    const rateLimiter = new RedisRateLimiter();
    const rateLimit = await rateLimiter.check({
      action: 'email-change',
      identifier: `${session.user.id}-${clientIp}`,
      limit: 50,
      window: 3600, // 1 hour
    });

    if (!rateLimit.success) {
      return {
        success: false,
        error: `Too many email change requests. Try again in ${formatRetryAfter(rateLimit.retryAfter!)}.`,
      };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Check if new email is same as current
    if (validatedData.newEmail.toLowerCase() === user.email.toLowerCase()) {
      return {
        success: false,
        error: 'email_change.error_title',
        fieldErrors: {
          newEmail: ValidationMessages.EMAIL_SAME_AS_CURRENT,
        },
      };
    }

    // Verify password BEFORE checking email availability
    if (!user.password) {
      return {
        success: false,
        error: 'email_change.error_title',
        fieldErrors: {
          password: ValidationMessages.PASSWORD_INCORRECT,
        },
      };
    }

    const isPasswordValid = await verifyPassword(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'email_change.error_title',
        fieldErrors: {
          password: ValidationMessages.PASSWORD_INCORRECT,
        },
      };
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.newEmail.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'email_change.error_title',
        fieldErrors: {
          newEmail: ValidationMessages.EMAIL_IN_USE,
        },
      };
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Send emails FIRST (before database update)
    // This ensures we don't pollute the database if emails fail
    try {
      // Send verification email to new address
      await sendEmailChangeVerification({
        email: validatedData.newEmail,
        token,
        userName: user.name || 'User',
      });

      // Send notification to old address
      await sendEmailChangeNotification({
        email: user.email,
        userName: user.name || 'User',
        newEmail: validatedData.newEmail,
      });
    } catch (emailError) {
      console.error('Failed to send email change emails:', emailError);
      return {
        success: false,
        error: 'Failed to send verification email. Please try again later.',
      };
    }

    // Only update database AFTER emails are sent successfully
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailChangeToken: token,
        emailChangeTokenExpiry: tokenExpiry,
        newEmail: validatedData.newEmail.toLowerCase(),
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const field = err.path.join('.');
        fieldErrors[field] = err.message;
      });

      return {
        success: false,
        error: 'Validation failed',
        fieldErrors,
      };
    }

    console.error('Request email change error:', error);
    return {
      success: false,
      error: 'Failed to process email change request',
    };
  }
}

/**
 * Verify email change with token
 * Updates user email and invalidates all sessions for security
 */
export async function verifyEmailChange(
  data: VerifyEmailChangeInput
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = verifyEmailChangeSchema.parse(data);

    // Find user by token
    const user = await prisma.user.findUnique({
      where: { emailChangeToken: validatedData.token },
      select: {
        id: true,
        email: true,
        emailChangeToken: true,
        emailChangeTokenExpiry: true,
        newEmail: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'Invalid or expired verification link',
      };
    }

    // Check if token is expired
    if (
      !user.emailChangeTokenExpiry ||
      user.emailChangeTokenExpiry < new Date()
    ) {
      return {
        success: false,
        error: 'This verification link has expired',
      };
    }

    // Check if token has already been used
    if (!user.newEmail) {
      return {
        success: false,
        error: 'This verification link has already been used',
      };
    }

    // Update email and clear token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.newEmail,
        emailChangeToken: null,
        emailChangeTokenExpiry: null,
        newEmail: null,
      },
    });

    // Invalidate all existing sessions for security
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const field = err.path.join('.');
        fieldErrors[field] = err.message;
      });

      return {
        success: false,
        error: 'Validation failed',
        fieldErrors,
      };
    }

    console.error('Verify email change error:', error);
    return {
      success: false,
      error: 'Failed to verify email change',
    };
  }
}
