'use server';

import { getCurrentUser } from '@repo/auth';
import { db } from '@repo/database';
import {
  updateUserProfileSchema,
  type UpdateUserProfileInput,
  ValidationMessages,
} from '@repo/validation';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';

import type { ActionResult } from './auth';

/**
 * User profile type
 */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  bio: string | null;
  image: string | null;
  role: string;
  createdAt: Date;
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile(): Promise<
  ActionResult<UserProfile>
> {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      data: {
        ...profile,
        role: profile.role as string,
      },
    };
  } catch (error) {
    console.error('Get current user profile error:', error);
    return {
      success: false,
      error: 'Failed to get user profile',
    };
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(
  userId: string
): Promise<ActionResult<UserProfile>> {
  try {
    const profile = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      data: {
        ...profile,
        role: profile.role as string,
      },
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return {
      success: false,
      error: 'Failed to get user profile',
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  data: UpdateUserProfileInput
): Promise<ActionResult<UserProfile>> {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Validate input
    const validatedData = updateUserProfileSchema.parse(data);

    // Check if username is already taken by another user
    if (validatedData.username) {
      const existingUser = await db.user.findUnique({
        where: { username: validatedData.username },
      });

      if (existingUser && existingUser.id !== user.id) {
        return {
          success: false,
          error: ValidationMessages.USERNAME_ALREADY_EXISTS,
          fieldErrors: {
            username: ValidationMessages.USERNAME_ALREADY_EXISTS,
          },
        };
      }
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: validatedData.name,
        username: validatedData.username,
        bio: validatedData.bio,
        image: validatedData.image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    // Revalidate profile page
    revalidatePath('/profile');

    return {
      success: true,
      data: {
        ...updatedUser,
        role: updatedUser.role as string,
      },
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
        error: 'Validation failed',
        fieldErrors,
      };
    }

    console.error('Update user profile error:', error);
    return {
      success: false,
      error: 'Failed to update profile',
    };
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<
  ActionResult<{
    notificationsCount: number;
  }>
> {
  try {
    const notificationsCount = await db.notification.count({
      where: { recipientId: userId },
    });

    return {
      success: true,
      data: {
        notificationsCount,
      },
    };
  } catch (error) {
    console.error('Get user stats error:', error);
    return {
      success: false,
      error: 'Failed to get user statistics',
    };
  }
}
