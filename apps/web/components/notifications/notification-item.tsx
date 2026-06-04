import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Stack,
} from '@repo/ui';
import Link from 'next/link';

import type { Notification } from '@prisma/client';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const isUnread = !notification.readAt;

  // Format relative time manually to avoid external dependencies
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <Card className={isUnread ? 'border-primary' : ''}>
      <CardHeader className="p-4">
        <Stack
          direction="row"
          align="start"
          justify="between"
          className="w-full"
          spacing="md"
        >
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              {isUnread && (
                <Badge
                  variant="default"
                  className="rounded-full h-2 w-2 p-0 border-0"
                  data-testid="unread-indicator"
                />
              )}
              {notification.title}
            </CardTitle>
            <CardDescription>{notification.message}</CardDescription>
            <p className="text-xs text-muted-foreground">
              {getRelativeTime(notification.createdAt)}
            </p>
          </div>

          <Stack direction="column" spacing="sm">
            {isUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
              >
                Mark as read
              </Button>
            )}
            {notification.link && (
              <Button variant="outline" size="sm" asChild>
                <Link href={notification.link}>View</Link>
              </Button>
            )}
          </Stack>
        </Stack>
      </CardHeader>
    </Card>
  );
}
