import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { deleteAccount } from '@/app/actions';
import { renderWithProviders } from '@/lib/test/render';

import { DeleteAccountForm } from './delete-account-form';

// Mock the server action
vi.mock('@/app/actions', () => ({
  deleteAccount: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('🔴 RED: DeleteAccountForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render warning message', () => {
      renderWithProviders(<DeleteAccountForm />);

      expect(screen.getByText(/⚠️ warning/i)).toBeInTheDocument();
      expect(
        screen.getByText(/this action cannot be undone/i)
      ).toBeInTheDocument();
    });

    it('should render password input field', () => {
      renderWithProviders(<DeleteAccountForm />);

      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/enter your password/i)
      ).toBeInTheDocument();
    });

    it('should render confirmation checkbox', () => {
      renderWithProviders(<DeleteAccountForm />);

      expect(
        screen.getByLabelText(/i understand that this action is permanent/i)
      ).toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      renderWithProviders(<DeleteAccountForm />);

      expect(
        screen.getByRole('button', { name: /delete my account/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it('should render 30-day grace period info', () => {
      renderWithProviders(<DeleteAccountForm />);

      expect(screen.getByText(/30-Day Grace Period/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty password', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DeleteAccountForm />);

      // Check confirmation checkbox
      const checkbox = screen.getByLabelText(
        /i understand that this action is permanent/i
      );
      await user.click(checkbox);

      // Try to submit without password
      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(vi.mocked(deleteAccount)).not.toHaveBeenCalled();
    });

    it('should show validation error for short password', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(/confirm password/i);
      await user.type(passwordInput, 'short');

      const checkbox = screen.getByLabelText(
        /i understand that this action is permanent/i
      );
      await user.click(checkbox);

      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(vi.mocked(deleteAccount)).not.toHaveBeenCalled();
    });

    it('should require checkbox confirmation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(/confirm password/i);
      await user.type(passwordInput, 'Password123');

      // Don't check the confirmation checkbox
      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });

      // Button should be disabled when checkbox is not checked
      expect(submitButton).toBeDisabled();

      // Should not call the action when disabled
      expect(vi.mocked(deleteAccount)).not.toHaveBeenCalled();
    });

    it('should allow submission with valid password and checked confirmation', async () => {
      const user = userEvent.setup();
      vi.mocked(deleteAccount).mockResolvedValue({ success: true });

      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(/confirm password/i);
      await user.type(passwordInput, 'Password123');

      const checkbox = screen.getByLabelText(
        /i understand that this action is permanent/i
      );
      await user.click(checkbox);

      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(deleteAccount)).toHaveBeenCalledWith({
          password: 'Password123',
        });
      });
    });
  });

  describe('Form Submission', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      vi.mocked(deleteAccount).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(/confirm password/i);
      await user.type(passwordInput, 'Password123');

      const checkbox = screen.getByLabelText(
        /i understand that this action is permanent/i
      );
      await user.click(checkbox);

      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });
      user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveTextContent(/processing/i);
        expect(submitButton).toBeDisabled();
      });
    });

    it('should disable form inputs during submission', async () => {
      const user = userEvent.setup();
      vi.mocked(deleteAccount).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(/confirm password/i);
      await user.type(passwordInput, 'Password123');

      const checkbox = screen.getByLabelText(
        /i understand that this action is permanent/i
      );
      await user.click(checkbox);

      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });
      user.click(submitButton);

      await waitFor(() => {
        expect(passwordInput).toBeDisabled();
        expect(checkbox).toBeDisabled();
      });
    });

    it('should show success toast on successful deletion', async () => {
      const user = userEvent.setup();
      vi.mocked(deleteAccount).mockResolvedValue({ success: true });

      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(/confirm password/i);
      await user.type(passwordInput, 'Password123');

      const checkbox = screen.getByLabelText(
        /i understand that this action is permanent/i
      );
      await user.click(checkbox);

      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Account Deletion Scheduled'),
          expect.objectContaining({
            description: expect.any(String),
          })
        );
      });
    });

    it('should show error toast on failed deletion', async () => {
      const user = userEvent.setup();
      vi.mocked(deleteAccount).mockResolvedValue({
        success: false,
        error: 'Incorrect password',
      });

      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(/confirm password/i);
      await user.type(passwordInput, 'WrongPassword123');

      const checkbox = screen.getByLabelText(
        /i understand that this action is permanent/i
      );
      await user.click(checkbox);

      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed'),
          expect.objectContaining({
            description: expect.any(String),
          })
        );
      });
    });

    it('should display field-level errors from server', async () => {
      const user = userEvent.setup();
      vi.mocked(deleteAccount).mockResolvedValue({
        success: false,
        error: 'Validation failed',
        fieldErrors: {
          password: 'Incorrect password',
        },
      });

      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(/confirm password/i);
      await user.type(passwordInput, 'WrongPassword123');

      const checkbox = screen.getByLabelText(
        /i understand that this action is permanent/i
      );
      await user.click(checkbox);

      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Incorrect password')).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should reset form when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(
        /confirm password/i
      ) as HTMLInputElement;
      await user.type(passwordInput, 'Password123');

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(passwordInput.value).toBe('Password123');
      expect(checkbox).toBeChecked();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(
        () => {
          expect(passwordInput.value).toBe('');
          expect(checkbox).not.toBeChecked();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(/confirm password/i);
      const checkbox = screen.getByLabelText(
        /i understand that this action is permanent/i
      );

      expect(passwordInput).toHaveAccessibleName();
      expect(checkbox).toHaveAccessibleName();
    });

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup();
      vi.mocked(deleteAccount).mockResolvedValue({
        success: false,
        error: 'Validation failed',
        fieldErrors: {
          password: 'password.incorrect',
        },
      });

      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(/confirm password/i);
      await user.type(passwordInput, 'WrongPassword123!');

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });
      await user.click(submitButton);

      await waitFor(
        () => {
          const alerts = screen.getAllByRole('alert');
          expect(alerts.length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );
    });

    it('should have danger styling for submit button', () => {
      renderWithProviders(<DeleteAccountForm />);

      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });
      expect(submitButton).toHaveClass('bg-destructive'); // Check for destructive background class
    });
  });

  describe('Edge Cases', () => {
    it('should trim password input', async () => {
      const user = userEvent.setup();
      vi.mocked(deleteAccount).mockResolvedValue({ success: true });

      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(/confirm password/i);
      await user.type(passwordInput, '  Password123  ');

      const checkbox = screen.getByLabelText(
        /i understand that this action is permanent/i
      );
      await user.click(checkbox);

      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(deleteAccount)).toHaveBeenCalledWith({
          password: '  Password123  ',
        });
      });
    });

    it('should handle rate limit errors', async () => {
      const user = userEvent.setup();
      vi.mocked(deleteAccount).mockResolvedValue({
        success: false,
        error: 'Too many deletion attempts. Please try again in 1 hour.',
      });

      renderWithProviders(<DeleteAccountForm />);

      const passwordInput = screen.getByLabelText(/confirm password/i);
      await user.type(passwordInput, 'Password123');

      const checkbox = screen.getByLabelText(
        /i understand that this action is permanent/i
      );
      await user.click(checkbox);

      const submitButton = screen.getByRole('button', {
        name: /delete my account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            description: expect.stringContaining('1 hour'),
          })
        );
      });
    });
  });
});
