import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import { renderWithProviders } from '@/lib/test/render';
import { NotificationBell } from './notification-bell';

vi.mock('@/app/actions/notification', () => ({
  getUnreadCount: vi.fn().mockResolvedValue({ success: true, data: 0 }),
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the bell icon', async () => {
    const { getUnreadCount } = await import('@/app/actions/notification');
    vi.mocked(getUnreadCount).mockResolvedValue({ success: true, data: 0 });

    renderWithProviders(<NotificationBell />, { disableTheme: true });

    // The bell button links to /notifications
    await waitFor(() => {
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  it('should not show badge when unread count is 0', async () => {
    const { getUnreadCount } = await import('@/app/actions/notification');
    vi.mocked(getUnreadCount).mockResolvedValue({ success: true, data: 0 });

    renderWithProviders(<NotificationBell />, { disableTheme: true });

    await waitFor(() => {
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  it('should render unread count badge when count is greater than 0', async () => {
    const { getUnreadCount } = await import('@/app/actions/notification');
    vi.mocked(getUnreadCount).mockResolvedValue({ success: true, data: 3 });

    renderWithProviders(<NotificationBell />, { disableTheme: true });

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should display "9+" when unread count exceeds 9', async () => {
    const { getUnreadCount } = await import('@/app/actions/notification');
    vi.mocked(getUnreadCount).mockResolvedValue({ success: true, data: 15 });

    renderWithProviders(<NotificationBell />, { disableTheme: true });

    await waitFor(() => {
      expect(screen.getByText('9+')).toBeInTheDocument();
    });
  });

  it('should navigate to /notifications when clicked', async () => {
    const { getUnreadCount } = await import('@/app/actions/notification');
    vi.mocked(getUnreadCount).mockResolvedValue({ success: true, data: 0 });

    renderWithProviders(<NotificationBell />, { disableTheme: true });

    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/notifications');
    });
  });
});
