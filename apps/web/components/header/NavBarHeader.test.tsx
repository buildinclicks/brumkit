import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import { renderWithProviders } from '@/lib/test/render';
import { NavBarHeader } from './NavBarHeader';

import type { Session } from 'next-auth';

// getUnreadCount is used by NotificationBell inside NavBarHeader
vi.mock('@/app/actions/notification', () => ({
  getUnreadCount: vi.fn().mockResolvedValue({ success: true, data: 0 }),
}));

const mockSession: Session = {
  user: {
    id: 'user_1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'USER',
    emailVerified: null,
  },
  expires: new Date(Date.now() + 3600 * 1000).toISOString(),
};

describe('NavBarHeader', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Re-set after clear so NotificationBell's async getUnreadCount call doesn't crash
    const { getUnreadCount } = await import('@/app/actions/notification');
    vi.mocked(getUnreadCount).mockResolvedValue({ success: true, data: 0 });
  });

  it('should render the Brumkit logo link', () => {
    renderWithProviders(<NavBarHeader session={mockSession} />, {
      disableTheme: true,
    });

    expect(screen.getByText('Brumkit')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    renderWithProviders(<NavBarHeader session={mockSession} />, {
      disableTheme: true,
    });

    expect(
      screen.getByRole('link', { name: /dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /notifications/i })
    ).toBeInTheDocument();
  });

  it('should render the user email', () => {
    renderWithProviders(<NavBarHeader session={mockSession} />, {
      disableTheme: true,
    });

    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('should render the sign out link', () => {
    renderWithProviders(<NavBarHeader session={mockSession} />, {
      disableTheme: true,
    });

    expect(screen.getByRole('link', { name: /sign out/i })).toBeInTheDocument();
  });

  it('should render the NotificationBell component', async () => {
    renderWithProviders(<NavBarHeader session={mockSession} />, {
      disableTheme: true,
    });

    // The bell link navigates to /notifications
    await waitFor(() => {
      const links = screen.getAllByRole('link');
      const bellLink = links.find((l) =>
        l.getAttribute('href')?.includes('/notifications')
      );
      expect(bellLink).toBeTruthy();
    });
  });
});
