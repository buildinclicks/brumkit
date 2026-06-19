'use server';

import { auth } from '@repo/auth';
import { db } from '@repo/database';
import { markNotificationAsReadSchema } from '@repo/validation';

import type { ActionResult } from './auth';
import type { Notification } from '@repo/database';

/**
 * Get all notifications for the current user
 */
export async function getNotifications(): Promise<
  ActionResult<Notification[]>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const notifications = await db.notification.findMany({
      where: {
        recipientId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error('Get notifications error:', error);
    return { success: false, error: 'Failed to fetch notifications' };
  }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(id: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Server-side schema validation — ensures id is a valid cuid
    const { id: validatedId } = markNotificationAsReadSchema.parse({ id });

    // Verify notification belongs to user
    const notification = await db.notification.findFirst({
      where: {
        id: validatedId,
        recipientId: session.user.id,
      },
    });

    if (!notification) {
      return { success: false, error: 'Notification not found' };
    }

    await db.notification.update({
      where: { id: validatedId },
      data: { readAt: new Date() },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return { success: false, error: 'Failed to mark notification as read' };
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead(): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.notification.updateMany({
      where: {
        recipientId: session.user.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Mark all as read error:', error);
    return { success: false, error: 'Failed to mark all as read' };
  }
}

/**
 * Get unread notification count for the current user
 */
export async function getUnreadCount(): Promise<ActionResult<number>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const count = await db.notification.count({
      where: {
        recipientId: session.user.id,
        readAt: null,
      },
    });

    return { success: true, data: count };
  } catch (error) {
    console.error('Get unread count error:', error);
    return { success: false, error: 'Failed to get unread count' };
  }
}
