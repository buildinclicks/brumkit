import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import NotFound from './not-found';

// Mock next-intl
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Page Not Found',
      heading: '404 - Page Not Found',
      description: "Sorry, we couldn't find the page you're looking for.",
      suggestions:
        'You might want to check the URL or try one of these options:',
      go_home: 'Go to Home',
      go_back: 'Go Back',
      go_to_dashboard: 'Go to Dashboard',
      contact_support: 'Contact Support',
    };
    return translations[key] || key;
  }),
}));

// Mock next/link
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

describe('🔴 RED: NotFound Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the 404 heading', async () => {
      const NotFoundPage = await NotFound();
      render(NotFoundPage);

      expect(
        screen.getByRole('heading', { name: /404.*not found/i })
      ).toBeInTheDocument();
    });

    it('should display descriptive error message', async () => {
      const NotFoundPage = await NotFound();
      render(NotFoundPage);

      expect(
        screen.getByText(/couldn't find the page you're looking for/i)
      ).toBeInTheDocument();
    });

    it('should render navigation links', async () => {
      const NotFoundPage = await NotFound();
      render(NotFoundPage);

      // Should have "Go to Home" link
      const homeLink = screen.getByRole('link', { name: /go to home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');

      // Should have "Go to Dashboard" link instead of the broken /articles link
      const dashboardLink = screen.getByRole('link', {
        name: /go to dashboard/i,
      });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('should not contain a link to /articles', async () => {
      const NotFoundPage = await NotFound();
      render(NotFoundPage);

      const links = screen.getAllByRole('link');
      const articlesLink = links.find(
        (link) => link.getAttribute('href') === '/articles'
      );
      expect(articlesLink).toBeUndefined();
    });

    it('should render helpful suggestions', async () => {
      const NotFoundPage = await NotFound();
      render(NotFoundPage);

      expect(
        screen.getByText(/you might want to check the url/i)
      ).toBeInTheDocument();
    });

    it('should render go back button', async () => {
      const NotFoundPage = await NotFound();
      render(NotFoundPage);

      // Should have "Go Back" button
      expect(
        screen.getByRole('button', { name: /go back/i })
      ).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have proper structure with centered content', async () => {
      const NotFoundPage = await NotFound();
      const { container } = render(NotFoundPage);

      // Should have a main container
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const NotFoundPage = await NotFound();
      render(NotFoundPage);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Main heading should be h1
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should have accessible navigation links', async () => {
      const NotFoundPage = await NotFound();
      render(NotFoundPage);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        // Each link should have accessible text
        expect(link).toHaveAccessibleName();
      });
    });
  });
});
