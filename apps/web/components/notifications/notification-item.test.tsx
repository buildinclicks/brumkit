import { describe, it, expect, vi } from 'vitest';

import { renderWithProviders, screen, userEvent } from '@/lib/test';

import { NotificationItem } from './notification-item';

import type { Notification } from '@repo/database';

describe('NotificationItem', () => {
  const mockNotification: Notification = {
    id: '1',
    type: 'SYSTEM',
    title: 'Test Notification',
    message: 'This is a test message',
    link: '/test',
    readAt: null,
    createdAt: new Date(),
    recipientId: 'user1',
  };

  it('should render notification title and message', () => {
    renderWithProviders(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={() => {}}
      />,
      { disableTheme: true }
    );

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
  });

  it('should show unread indicator for unread notifications', () => {
    renderWithProviders(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={() => {}}
      />,
      { disableTheme: true }
    );

    expect(screen.getByTestId('unread-indicator')).toBeInTheDocument();
  });

  it('should not show unread indicator for read notifications', () => {
    const readNotification = { ...mockNotification, readAt: new Date() };

    renderWithProviders(
      <NotificationItem
        notification={readNotification}
        onMarkAsRead={() => {}}
      />,
      { disableTheme: true }
    );

    expect(screen.queryByTestId('unread-indicator')).not.toBeInTheDocument();
  });

  it('should call onMarkAsRead when mark as read button clicked', async () => {
    const user = userEvent.setup();
    const onMarkAsRead = vi.fn();

    renderWithProviders(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={onMarkAsRead}
      />,
      { disableTheme: true }
    );

    await user.click(screen.getByRole('button', { name: /mark as read/i }));

    expect(onMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('should not show mark as read button for read notifications', () => {
    const readNotification = { ...mockNotification, readAt: new Date() };

    renderWithProviders(
      <NotificationItem
        notification={readNotification}
        onMarkAsRead={() => {}}
      />,
      { disableTheme: true }
    );

    expect(
      screen.queryByRole('button', { name: /mark as read/i })
    ).not.toBeInTheDocument();
  });

  it('should show "just now" for very recent notifications', () => {
    const recentNotification = {
      ...mockNotification,
      createdAt: new Date(Date.now() - 10_000), // 10 seconds ago
    };

    renderWithProviders(
      <NotificationItem
        notification={recentNotification}
        onMarkAsRead={() => {}}
      />,
      { disableTheme: true }
    );

    expect(screen.getByText('just now')).toBeInTheDocument();
  });

  it('should show minutes ago for notifications 1-59 minutes old', () => {
    const minutesAgoNotification = {
      ...mockNotification,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    };

    renderWithProviders(
      <NotificationItem
        notification={minutesAgoNotification}
        onMarkAsRead={() => {}}
      />,
      { disableTheme: true }
    );

    expect(screen.getByText(/minutes ago/i)).toBeInTheDocument();
  });

  it('should show hours ago for notifications 1-23 hours old', () => {
    const hoursAgoNotification = {
      ...mockNotification,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    };

    renderWithProviders(
      <NotificationItem
        notification={hoursAgoNotification}
        onMarkAsRead={() => {}}
      />,
      { disableTheme: true }
    );

    expect(screen.getByText(/hours ago/i)).toBeInTheDocument();
  });

  it('should show days ago for notifications older than 24 hours', () => {
    const daysAgoNotification = {
      ...mockNotification,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    };

    renderWithProviders(
      <NotificationItem
        notification={daysAgoNotification}
        onMarkAsRead={() => {}}
      />,
      { disableTheme: true }
    );

    expect(screen.getByText(/days ago/i)).toBeInTheDocument();
  });

  it('should render a View link when notification has a link', () => {
    renderWithProviders(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={() => {}}
      />,
      { disableTheme: true }
    );

    expect(screen.getByRole('link', { name: /view/i })).toBeInTheDocument();
  });

  it('should not render a View link when notification has no link', () => {
    const noLinkNotification = { ...mockNotification, link: null };

    renderWithProviders(
      <NotificationItem
        notification={noLinkNotification}
        onMarkAsRead={() => {}}
      />,
      { disableTheme: true }
    );

    expect(
      screen.queryByRole('link', { name: /view/i })
    ).not.toBeInTheDocument();
  });
});
