'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
} from '@repo/ui';
import { AlertCircle, BellOff } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from '@/app/actions/notification';
import { NotificationSkeleton } from '@/components/skeletons/notification-skeleton';

import { NotificationItem } from './notification-item';

import type { Notification } from '@repo/database';

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void getNotifications().then((result) => {
      if (!active) return;
      if (result.success) {
        setNotifications(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const result = await markAsRead(id);
    if (result.success) {
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n))
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead();
    if (result.success) {
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date() }))
      );
    }
  };

  if (loading) {
    return <NotificationSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BellOff className="text-muted-foreground h-12 w-12 mb-4" />
          <h3 className="text-lg font-semibold">No notifications</h3>
          <p className="text-muted-foreground text-sm">
            You&apos;re all caught up! check back later for new updates.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div className="space-y-4">
      {hasUnread && (
        <div className="flex justify-end">
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            Mark all as read
          </Button>
        </div>
      )}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>
    </div>
  );
}
