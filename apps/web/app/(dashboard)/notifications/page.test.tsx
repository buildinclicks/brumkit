import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import NotificationsPage from './page';

// Mock Suspense boundary
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    Suspense: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock NotificationList component
vi.mock('@/components/notifications/notification-list', () => ({
  NotificationList: () => (
    <div data-testid="notification-list">Notification List Content</div>
  ),
}));

describe('NotificationsPage', () => {
  it('should render page title', () => {
    render(<NotificationsPage />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('should render notification list', () => {
    render(<NotificationsPage />);
    expect(screen.getByTestId('notification-list')).toBeInTheDocument();
  });
});
