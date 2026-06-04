/**
 * Reset Password Page Tests (TDD)
 *
 * GREEN: Tests should now PASS with implementation
 *
 * This page is accessed via: /reset-password?token=xxx
 *
 * Test Coverage:
 * - Page rendering ✓
 * - Token validation ✓
 * - Password validation ✓
 * - Form submission ✓
 * - Success/error states ✓
 * - Accessibility ✓
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { renderWithProviders, screen, waitFor, userEvent } from '@/lib/test';

// Import the component
import ResetPasswordPage from './page';

// Mock server action
const mockResetPassword = vi.fn();
vi.mock('@/app/actions', () => ({
  resetPassword: (...args: any[]) => mockResetPassword(...args),
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

describe('GREEN: ResetPasswordPage (TDD)', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetParam.mockImplementation((key: string) =>
      key === 'token' ? 'valid-token-123' : null
    );
  });

  describe('Rendering', () => {
    it('should render reset password form', () => {
      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      expect(
        screen.getByText(/reset password/i, { selector: 'div' })
      ).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(
        screen.getByLabelText(/confirm new password/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /reset password/i })
      ).toBeInTheDocument();
    });

    it('should show helpful instructions', () => {
      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      expect(screen.getByText(/enter your new password/i)).toBeInTheDocument();
    });

    it('should show error for missing token', () => {
      mockGetParam.mockReturnValue(null);

      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      expect(
        screen.getByText(/invalid.*link/i, { selector: 'div' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /request new/i })
      ).toBeInTheDocument();
    });
  });

  describe('Password Validation', () => {
    it('should show error for weak password', async () => {
      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      const passwordInput = screen.getByLabelText('New Password');
      await user.type(passwordInput, 'weak');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should show error for password mismatch', async () => {
      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      await user.type(screen.getByLabelText('New Password'), 'Password123!');
      await user.type(
        screen.getByLabelText('Confirm New Password'),
        'DifferentPassword123!'
      );
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should not show errors on initial render', () => {
      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should successfully reset password', async () => {
      const { toast } = await import('sonner');
      mockResetPassword.mockResolvedValue({
        success: true,
        data: { message: 'Password reset successfully' },
      });

      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      await user.type(screen.getByLabelText('New Password'), 'NewPassword123!');
      await user.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword123!'
      );
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith({
          token: 'valid-token-123',
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        });
        expect(toast.success).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should disable button while submitting', async () => {
      mockResetPassword.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      await user.type(screen.getByLabelText('New Password'), 'NewPassword123!');
      await user.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword123!'
      );
      const submitButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/resetting/i);
    });

    it('should show error for invalid/expired token', async () => {
      const { toast } = await import('sonner');
      mockResetPassword.mockResolvedValue({
        success: false,
        error: 'This reset link is invalid or has expired',
      });

      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      await user.type(screen.getByLabelText('New Password'), 'NewPassword123!');
      await user.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword123!'
      );
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('should show error on server error', async () => {
      const { toast } = await import('sonner');
      mockResetPassword.mockResolvedValue({
        success: false,
        error: 'Server error occurred',
      });

      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      await user.type(screen.getByLabelText('New Password'), 'NewPassword123!');
      await user.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword123!'
      );
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for inputs', () => {
      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    });

    it('should display errors with role="alert"', async () => {
      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      const submitButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
      });
    });

    it('should have descriptive button text', () => {
      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      expect(
        screen.getByRole('button', { name: /reset password/i })
      ).toBeInTheDocument();
    });
  });

  describe('UX', () => {
    it('should show password requirements hint', () => {
      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    it('should redirect to login after successful reset', async () => {
      mockResetPassword.mockResolvedValue({
        success: true,
        data: { message: 'Success' },
      });

      renderWithProviders(<ResetPasswordPage />, { disableTheme: true });

      await user.type(screen.getByLabelText('New Password'), 'NewPassword123!');
      await user.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword123!'
      );
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });
});
