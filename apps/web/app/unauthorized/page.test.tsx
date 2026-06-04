import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import UnauthorizedPage from './page';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Unauthorized',
      heading: 'Access Denied',
      description: "You don't have the required permissions to view this page.",
      back_to_dashboard: 'Back to Dashboard',
      go_home: 'Go to Home',
    };
    return translations[key] || key;
  }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('UnauthorizedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the Access Denied heading', async () => {
      const Page = await UnauthorizedPage();
      render(Page);

      expect(
        screen.getByRole('heading', { name: /access denied/i })
      ).toBeInTheDocument();
    });

    it('should display the permissions error description', async () => {
      const Page = await UnauthorizedPage();
      render(Page);

      expect(screen.getByText(/required permissions/i)).toBeInTheDocument();
    });

    it('should render a Back to Dashboard link pointing to /dashboard', async () => {
      const Page = await UnauthorizedPage();
      render(Page);

      const dashboardLink = screen.getByRole('link', {
        name: /back to dashboard/i,
      });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('should render a Go to Home link pointing to /', async () => {
      const Page = await UnauthorizedPage();
      render(Page);

      const homeLink = screen.getByRole('link', { name: /go to home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Structure', () => {
    it('should have a main element as the root container', async () => {
      const Page = await UnauthorizedPage();
      const { container } = render(Page);

      expect(container.querySelector('main')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have a level-1 heading', async () => {
      const Page = await UnauthorizedPage();
      render(Page);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have accessible link text on all links', async () => {
      const Page = await UnauthorizedPage();
      render(Page);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAccessibleName();
      });
    });
  });
});
