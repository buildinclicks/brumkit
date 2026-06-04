import { describe, it, expect, vi } from 'vitest';

import { renderWithProviders, screen } from '@/lib/test';

import { NotificationList } from './notification-list';

import type { Notification } from '@prisma/client';

// Mock the notification actions
vi.mock('@/app/actions/notification', () => ({
  getNotifications: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
}));

describe('NotificationList', () => {
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'SYSTEM',
      title: 'Notification 1',
      message: 'Message 1',
      link: null,
      readAt: null,
      createdAt: new Date(),
      recipientId: 'user1',
    },
    {
      id: '2',
      type: 'ACCOUNT',
      title: 'Notification 2',
      message: 'Message 2',
      link: null,
      readAt: new Date(),
      createdAt: new Date(),
      recipientId: 'user1',
    },
  ];

  it('should render empty state when no notifications', async () => {
    const { getNotifications } = await import('@/app/actions/notification');
    vi.mocked(getNotifications).mockResolvedValue({
      success: true,
      data: [],
    });

    renderWithProviders(<NotificationList />, { disableTheme: true });

    // Wait for async loading
    const emptyText = await screen.findByText(/no notifications/i);
    expect(emptyText).toBeInTheDocument();
  });

  it('should render notifications list', async () => {
    const { getNotifications } = await import('@/app/actions/notification');
    vi.mocked(getNotifications).mockResolvedValue({
      success: true,
      data: mockNotifications,
    });

    renderWithProviders(<NotificationList />, { disableTheme: true });

    const notification1 = await screen.findByText('Notification 1');
    const notification2 = await screen.findByText('Notification 2');

    expect(notification1).toBeInTheDocument();
    expect(notification2).toBeInTheDocument();
  });

  it('should show mark all as read button when there are unread notifications', async () => {
    const { getNotifications } = await import('@/app/actions/notification');
    vi.mocked(getNotifications).mockResolvedValue({
      success: true,
      data: mockNotifications,
    });

    renderWithProviders(<NotificationList />, { disableTheme: true });

    const markAllButton = await screen.findByRole('button', {
      name: /mark all as read/i,
    });
    expect(markAllButton).toBeInTheDocument();
  });

  it('should render error state when getNotifications fails', async () => {
    const { getNotifications } = await import('@/app/actions/notification');
    vi.mocked(getNotifications).mockResolvedValue({
      success: false,
      error: 'Failed to load notifications',
    });

    renderWithProviders(<NotificationList />, { disableTheme: true });

    const errorText = await screen.findByText(/failed to load notifications/i);
    expect(errorText).toBeInTheDocument();
  });

  it('should mark notification as read when mark-as-read button is clicked', async () => {
    const { getNotifications, markAsRead } =
      await import('@/app/actions/notification');
    vi.mocked(getNotifications).mockResolvedValue({
      success: true,
      data: mockNotifications,
    });
    vi.mocked(markAsRead).mockResolvedValue({ success: true });

    const user = (await import('@testing-library/user-event')).default.setup();
    renderWithProviders(<NotificationList />, { disableTheme: true });

    const markAsReadButtons = await screen.findAllByRole('button', {
      name: /mark as read/i,
    });
    await user.click(markAsReadButtons[0]!);

    expect(markAsRead).toHaveBeenCalledWith('1');
  });

  it('should mark all notifications as read when mark-all button is clicked', async () => {
    const { getNotifications, markAllAsRead } =
      await import('@/app/actions/notification');
    vi.mocked(getNotifications).mockResolvedValue({
      success: true,
      data: mockNotifications,
    });
    vi.mocked(markAllAsRead).mockResolvedValue({ success: true });

    const user = (await import('@testing-library/user-event')).default.setup();
    renderWithProviders(<NotificationList />, { disableTheme: true });

    const markAllButton = await screen.findByRole('button', {
      name: /mark all as read/i,
    });
    await user.click(markAllButton);

    expect(markAllAsRead).toHaveBeenCalled();
  });
});
