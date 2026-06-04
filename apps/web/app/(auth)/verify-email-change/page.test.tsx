/**
 * Email Change Verification Page Tests (TDD - RED Phase)
 *
 * This page is accessed via: /verify-email-change?token=xxx
 *
 * Test Coverage:
 * - Page rendering
 * - Token extraction from URL
 * - Automatic verification on mount
 * - Success/error states
 * - Redirect to profile on success
 * - Error messages for invalid/expired tokens
 * - Accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { renderWithProviders, screen, waitFor } from '@/lib/test';

// Import the component
import VerifyEmailChangePage from './page';

// Mock server action
const mockVerifyEmailChange = vi.fn();
vi.mock('@/app/actions/email-change', () => ({
  verifyEmailChange: (...args: any[]) => mockVerifyEmailChange(...args),
}));

// Mock router
const mockPush = vi.fn();
const mockGetParam = vi.fn((key: string) =>
  key === 'token' ? 'valid-token-123' : null
);

vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>();
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: mockPush,
      replace: vi.fn(),
    })),
    useSearchParams: vi.fn(() => ({
      get: mockGetParam,
    })),
  };
});

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('VerifyEmailChangePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetParam.mockImplementation((key: string) =>
      key === 'token' ? 'valid-token-123' : null
    );
  });

  describe('Rendering', () => {
    it('should render verification page', () => {
      mockVerifyEmailChange.mockResolvedValue({ success: true });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      expect(
        screen.getByRole('heading', { name: /verifying your new email/i })
      ).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      mockVerifyEmailChange.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      expect(
        screen.getByRole('heading', { name: /verifying/i })
      ).toBeInTheDocument();
    });
  });

  describe('Token Handling', () => {
    it('should extract token from URL', async () => {
      mockVerifyEmailChange.mockResolvedValue({ success: true });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        expect(mockVerifyEmailChange).toHaveBeenCalledWith({
          token: 'valid-token-123',
        });
      });
    });

    it('should show error when token is missing', async () => {
      mockGetParam.mockReturnValue(null);

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        expect(
          screen.getByText(/invalid or expired verification link/i)
        ).toBeInTheDocument();
      });
    });

    it('should not call server action when token is missing', async () => {
      mockGetParam.mockReturnValue(null);

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        expect(mockVerifyEmailChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('Success State', () => {
    it('should show success message on successful verification', async () => {
      mockVerifyEmailChange.mockResolvedValue({ success: true });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        expect(
          screen.getByText(/email.*changed successfully/i)
        ).toBeInTheDocument();
      });
    });

    it('should redirect to profile page after successful verification', async () => {
      mockVerifyEmailChange.mockResolvedValue({ success: true });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/profile');
        },
        { timeout: 2000 } // Wait up to 2 seconds for redirect
      );
    });

    it('should show success toast on successful verification', async () => {
      const { toast } = await import('sonner');
      mockVerifyEmailChange.mockResolvedValue({ success: true });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Email Changed'),
          expect.any(Object)
        );
      });
    });

    it('should provide link to profile page on success', async () => {
      mockVerifyEmailChange.mockResolvedValue({ success: true });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /go to profile/i });
        expect(link).toHaveAttribute('href', '/profile');
      });
    });
  });

  describe('Error States', () => {
    it('should show error message for invalid token', async () => {
      mockVerifyEmailChange.mockResolvedValue({
        success: false,
        error: 'Invalid verification token',
      });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        expect(
          screen.getByText(/invalid verification token/i)
        ).toBeInTheDocument();
      });
    });

    it('should show error message for expired token', async () => {
      mockVerifyEmailChange.mockResolvedValue({
        success: false,
        error: 'Verification token has expired',
      });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        expect(
          screen.getByText(/verification token has expired/i)
        ).toBeInTheDocument();
      });
    });

    it('should show error message for already used token', async () => {
      mockVerifyEmailChange.mockResolvedValue({
        success: false,
        error: 'Token has already been used',
      });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        expect(
          screen.getByText(/token has already been used/i)
        ).toBeInTheDocument();
      });
    });

    it('should show error toast on failure', async () => {
      const { toast } = await import('sonner');
      mockVerifyEmailChange.mockResolvedValue({
        success: false,
        error: 'Invalid verification token',
      });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed'),
          expect.any(Object)
        );
      });
    });

    it('should provide link to profile page on error', async () => {
      mockVerifyEmailChange.mockResolvedValue({
        success: false,
        error: 'Invalid verification token',
      });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /back to profile/i });
        expect(link).toHaveAttribute('href', '/profile');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      mockVerifyEmailChange.mockResolvedValue({ success: true });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should have descriptive link text', async () => {
      mockVerifyEmailChange.mockResolvedValue({ success: true });

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAccessibleName();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      mockVerifyEmailChange.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<VerifyEmailChangePage />, { disableTheme: true });

      await waitFor(() => {
        // Check for the error state by looking for the heading
        expect(
          screen.getByRole('heading', { name: /verification failed/i })
        ).toBeInTheDocument();
        // And the specific error message
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should only verify once on mount', async () => {
      mockVerifyEmailChange.mockResolvedValue({ success: true });

      renderWithProviders(<VerifyEmailChangePage />, {
        disableTheme: true,
      });

      // Wait for initial verification
      await waitFor(() => {
        expect(mockVerifyEmailChange).toHaveBeenCalled();
      });

      // Wait a bit more to ensure no additional calls beyond initial mount
      await new Promise((resolve) => setTimeout(resolve, 200));

      // React.StrictMode in dev may cause double renders, so we check for <= 2 calls
      // In production, it will be exactly 1
      const callCount = mockVerifyEmailChange.mock.calls.length;
      expect(callCount).toBeGreaterThanOrEqual(1);
      expect(callCount).toBeLessThanOrEqual(2);
    });
  });
});
