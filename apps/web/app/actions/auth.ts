'use server';

import {
  hashPassword,
  verifyMagicLinkToken,
  generateMagicLinkToken,
} from '@repo/auth';
import { UserRole, db } from '@repo/database';
import { sendVerificationEmail } from '@repo/email';
import { RedisRateLimiter } from '@repo/rate-limit';
import {
  registerSchema,
  type RegisterInput,
  loginSchema,
  type LoginInput,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  type ResetPasswordInput,
  ValidationMessages,
} from '@repo/validation';
import { headers } from 'next/headers';
import { ZodError, z } from 'zod';

import { getClientIp, formatRetryAfter } from '@/lib/utils/rate-limit-helpers';

/**
 * Action result type for consistent error handling
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Register a new user with soft email verification
 *
 * Flow:
 * 1. Create user account (emailVerified = null)
 * 2. Generate verification token
 * 3. Send verification email
 * 4. Auto-login user (soft verification)
 */
export async function registerUser(
  data: RegisterInput
): Promise<ActionResult<{ userId: string }>> {
  try {
    // Validate input
    const validatedData = registerSchema.parse(data);

    // Get client IP
    const headersList = await headers();
    const clientIp = getClientIp(headersList);

    // Check rate limits (both email and IP)
    const rateLimiter = new RedisRateLimiter();

    // Check email-based rate limit (strict: 3 attempts / 1 hour)
    const emailRateLimit = await rateLimiter.check({
      action: 'register',
      identifier: validatedData.email,
      limit: 3,
      window: 3600, // 1 hour
    });

    if (!emailRateLimit.success) {
      return {
        success: false,
        error: `Too many registration attempts. Please try again in ${formatRetryAfter(emailRateLimit.retryAfter!)}.`,
      };
    }

    // Check IP-based rate limit (lenient: 10 attempts / 1 hour)
    const ipRateLimit = await rateLimiter.check({
      action: 'register-ip',
      identifier: clientIp,
      limit: 10,
      window: 3600,
    });

    if (!ipRateLimit.success) {
      return {
        success: false,
        error: `Too many registration attempts. Please try again in ${formatRetryAfter(ipRateLimit.retryAfter!)}.`,
      };
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'register.error_failed',
        fieldErrors: {
          email: 'email.already_exists',
        },
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user (emailVerified is null by default)
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: UserRole.USER,
        emailVerified: null, // Explicit: not verified yet
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Generate verification token (24 hour expiry)
    const token = await generateMagicLinkToken(user.email);

    // Send verification email (non-blocking, catch errors)
    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name || 'there',
        token,
      });
    } catch (emailError) {
      // Log error but don't fail registration
      console.error('Failed to send verification email:', emailError);
      // User can still login and resend verification later
    }

    return {
      success: true,
      data: { userId: user.id },
    };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const field = err.path.join('.');
        fieldErrors[field] = err.message;
      });

      return {
        success: false,
        error: 'register.error_validation',
        fieldErrors,
      };
    }

    // Handle other errors
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'register.error_unexpected',
    };
  }
}

/**
 * Login user with rate limiting
 *
 * Rate Limits:
 * - Email: 5 attempts per 15 minutes
 * - IP: 20 attempts per 15 minutes
 */
export async function loginUser(data: LoginInput): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = loginSchema.parse(data);

    // Get client IP
    const headersList = await headers();
    const clientIp = getClientIp(headersList);

    // Check rate limits (both email and IP)
    const rateLimiter = new RedisRateLimiter();

    // Check email-based rate limit (5 attempts / 15 min)
    const emailRateLimit = await rateLimiter.check({
      action: 'login',
      identifier: validatedData.email.toLowerCase(),
      limit: 5,
      window: 900, // 15 minutes
    });

    if (!emailRateLimit.success) {
      return {
        success: false,
        error: `Too many login attempts. Please try again in ${formatRetryAfter(emailRateLimit.retryAfter!)}.`,
      };
    }

    // Check IP-based rate limit (20 attempts / 15 min)
    const ipRateLimit = await rateLimiter.check({
      action: 'login-ip',
      identifier: clientIp,
      limit: 20,
      window: 900,
    });

    if (!ipRateLimit.success) {
      return {
        success: false,
        error: `Too many login attempts. Please try again in ${formatRetryAfter(ipRateLimit.retryAfter!)}.`,
      };
    }

    // Verify credentials
    const { verifyPassword } = await import('@repo/auth');
    const user = await db.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
      select: { id: true, email: true, password: true },
    });

    if (!user || !user.password) {
      return {
        success: false,
        error: 'login.error_invalid',
      };
    }

    const isValid = await verifyPassword(validatedData.password, user.password);

    if (!isValid) {
      return {
        success: false,
        error: 'login.error_invalid',
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const field = err.path.join('.');
        fieldErrors[field] = err.message;
      });

      return {
        success: false,
        error: 'register.error_validation',
        fieldErrors,
      };
    }

    console.error('Login error:', error);
    return {
      success: false,
      error: 'register.error_unexpected',
    };
  }
}

/**
 * Change user password (requires current password)
 */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  try {
    const { currentPassword, newPassword } = data;

    // Get current user
    const { getCurrentUser } = await import('@repo/auth');
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        success: false,
        error: 'change_password.error_not_authenticated',
      };
    }

    // Get user with password
    const user = await db.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, password: true },
    });

    if (!user || !user.password) {
      return {
        success: false,
        error: 'change_password.error_user_not_found',
      };
    }

    // Verify current password
    const { verifyPassword } = await import('@repo/auth');
    const isValid = await verifyPassword(currentPassword, user.password);

    if (!isValid) {
      return {
        success: false,
        error: 'change_password.error_title',
        fieldErrors: {
          currentPassword: ValidationMessages.PASSWORD_INCORRECT,
        },
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 🟢 GREEN: Send password changed notification email
    try {
      const userWithEmail = await db.user.findUnique({
        where: { id: user.id },
        select: { email: true, name: true },
      });

      if (userWithEmail) {
        const { sendPasswordChangedEmail } = await import('@repo/email');
        await sendPasswordChangedEmail({
          to: userWithEmail.email,
          name: userWithEmail.name || 'there',
        });
      }
    } catch (emailError) {
      // Log error but don't fail the password change
      console.error('Failed to send password changed email:', emailError);
      // Password was successfully changed, email is just a notification
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: 'change_password.error_title',
    };
  }
}

/**
 * Request password reset (send email with token)
 */
export async function requestPasswordReset(data: {
  email: string;
}): Promise<ActionResult<{ message: string }>> {
  try {
    // Validate email format
    const validatedEmail = resetPasswordRequestSchema.parse(data);

    // Get client IP
    const headersList = await headers();
    const clientIp = getClientIp(headersList);

    // Check rate limits (both email and IP) BEFORE database query
    const rateLimiter = new RedisRateLimiter();

    // Check email-based rate limit (strict: 3 attempts / 5 minutes)
    const emailRateLimit = await rateLimiter.check({
      action: 'password-reset',
      identifier: validatedEmail.email,
      limit: 3,
      window: 300, // 5 minutes
    });

    if (!emailRateLimit.success) {
      return {
        success: false,
        error: `Too many requests. Try again in ${formatRetryAfter(emailRateLimit.retryAfter!)}.`,
      };
    }

    // Check IP-based rate limit (lenient: 10 attempts / 5 minutes)
    const ipRateLimit = await rateLimiter.check({
      action: 'password-reset-ip',
      identifier: clientIp,
      limit: 10,
      window: 300,
    });

    if (!ipRateLimit.success) {
      return {
        success: false,
        error: `Too many requests. Try again in ${formatRetryAfter(ipRateLimit.retryAfter!)}.`,
      };
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: validatedEmail.email },
      select: { id: true, email: true, name: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        data: {
          message: 'If that email exists, we sent a reset link',
        },
      };
    }

    // Generate reset token
    const token = await generateMagicLinkToken(validatedEmail.email);

    // Send password reset email
    try {
      const { sendPasswordResetEmail } = await import('@repo/email');
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name || 'there',
        token,
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success to prevent email enumeration
      // The user will see the success message but won't receive an email
      // In production, you might want to log this for monitoring
    }

    return {
      success: true,
      data: {
        message: 'If that email exists, we sent a reset link',
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'forgot_password.error_invalid_email',
        fieldErrors: { email: 'email.invalid' },
      };
    }

    console.error('Password reset request error:', error);
    return {
      success: false,
      error: 'forgot_password.error_toast_title',
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  data: ResetPasswordInput
): Promise<ActionResult<{ message: string }>> {
  try {
    // Validate input (this checks password match, strength, etc.)
    const validated = resetPasswordSchema.parse(data);
    const { token, password } = validated;

    // Verify token and get email
    const email = await verifyMagicLinkToken(token);

    if (!email) {
      return {
        success: false,
        error:
          'This reset link is invalid or has expired. Please request a new one.',
      };
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      data: {
        message: 'Password reset successfully! You can now sign in.',
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Map Zod errors to field errors
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((err) => {
        if (err.path.length > 0) {
          const field = err.path[0] as string;
          fieldErrors[field] = err.message;
        }
      });

      return {
        success: false,
        error: 'reset_password.error_validation',
        fieldErrors,
      };
    }

    console.error('Password reset error:', error);
    return {
      success: false,
      error: 'reset_password.error_failed',
    };
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(
  token: string
): Promise<ActionResult<{ email: string }>> {
  try {
    // Verify token and get email

    const email = await verifyMagicLinkToken(token);

    if (!email) {
      return {
        success: false,
        error: 'Invalid or expired verification token',
      };
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, emailVerified: true },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Check if already verified
    if (user.emailVerified) {
      return {
        success: true,
        data: { email }, // Already verified, return success
      };
    }

    // Update user as verified
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Send welcome email
    try {
      const { sendWelcomeEmail } = await import('@repo/email');
      await sendWelcomeEmail({
        to: email,
        name: user.name || 'there',
      });
    } catch (emailError) {
      // Log error but don't fail verification
      console.error('Failed to send welcome email:', emailError);
    }

    return {
      success: true,
      data: { email },
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      error: 'Failed to verify email',
    };
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(
  email: string
): Promise<ActionResult> {
  try {
    const rateLimiter = new RedisRateLimiter();
    const rateLimit = await rateLimiter.check({
      action: 'resend-verification',
      identifier: email,
      limit: 3,
      window: 3600,
    });

    if (!rateLimit.success) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      };
    }
    // Get user
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, emailVerified: true },
    });

    if (!user) {
      // Don't reveal if user exists (security)
      return { success: true, data: undefined };
    }

    // Check if already verified
    if (user.emailVerified) {
      return {
        success: false,
        error: 'Email is already verified',
      };
    }

    // Generate new verification token
    const token = await generateMagicLinkToken(email);

    // Send verification email
    await sendVerificationEmail({
      to: email,
      name: user.name || 'there',
      token,
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Resend verification email error:', error);
    return {
      success: false,
      error: 'Failed to resend verification email',
    };
  }
}
