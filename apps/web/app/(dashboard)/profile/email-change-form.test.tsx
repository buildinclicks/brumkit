import { describe, it, expect, vi, beforeEach } from 'vitest';

import { requestEmailChangeSchema } from '@repo/validation';
import { requestEmailChange } from '@/app/actions/email-change';
import { renderWithProviders, screen, waitFor, userEvent } from '@/lib/test';

import { EmailChangeForm } from './email-change-form';

// Mock the server action
vi.mock('@/app/actions/email-change', () => ({
  requestEmailChange: vi.fn(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('EmailChangeForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requestEmailChange).mockResolvedValue({ success: true });
  });

  describe('Rendering', () => {
    it('should render form with all required fields', () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      expect(screen.getByText(/^Current Email$/i)).toBeInTheDocument();
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
      expect(screen.getByLabelText(/new email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /email change/i })
      ).toBeInTheDocument();
    });

    it('should display current email as static text', () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      expect(screen.getByText('user@example.com')).toBeInTheDocument();
      // Should not be an input field
      expect(
        screen.queryByDisplayValue('user@example.com')
      ).not.toBeInTheDocument();
    });

    it('should render password field as password type by default', () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      expect(screen.getByLabelText(/current password/i)).toHaveAttribute(
        'type',
        'password'
      );
    });

    it('should have show/hide toggle button for password field', () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      const toggleButton = screen.getByRole('button', {
        name: /show password|hide password/i,
      });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should show security notice', () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      expect(
        screen.getByText(/sent a verification link to your new email address/i)
      ).toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      const passwordInput = screen.getByLabelText(/current password/i);
      const toggleButton = screen.getByRole('button', {
        name: /show password|hide password/i,
      });

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Validation', () => {
    it('should show error for empty new email', async () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      const submitButton = screen.getByRole('button', {
        name: /email change/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        // Both email and password will be empty, so both will have errors
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
        // After trim, empty string fails email validation with "invalid" message
        expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
      });
    });

    it('should reject email that is too short at the schema level', () => {
      // HTML5 type="email" blocks form submission for short emails in real browsers,
      // so we test the Zod schema directly instead of via UI interaction.
      const result = requestEmailChangeSchema.safeParse({
        newEmail: 'a@b',
        password: 'Password123!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailIssue = result.error.issues.find((issue) =>
          issue.path.includes('newEmail')
        );
        expect(emailIssue).toBeDefined();
        expect(emailIssue?.message).toMatch(/at least 5|too short|invalid/i);
      }
    });

    it('should show error for empty password', async () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      await user.type(screen.getByLabelText(/new email/i), 'new@example.com');

      const submitButton = screen.getByRole('button', {
        name: /email change/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should show error for weak password', async () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      await user.type(screen.getByLabelText(/new email/i), 'new@example.com');
      await user.type(screen.getByLabelText(/current password/i), 'weak');

      const submitButton = screen.getByRole('button', {
        name: /email change/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password.*least/i)).toBeInTheDocument();
      });
    });

    it('should not show validation errors on initial render', () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call requestEmailChange with correct data', async () => {
      vi.mocked(requestEmailChange).mockResolvedValue({ success: true });

      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      await user.type(screen.getByLabelText(/new email/i), 'new@example.com');
      await user.type(
        screen.getByLabelText(/current password/i),
        'Password123!'
      );

      const submitButton = screen.getByRole('button', {
        name: /email change/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(requestEmailChange).toHaveBeenCalledWith({
          newEmail: 'new@example.com',
          password: 'Password123!',
        });
      });
    });

    it('should show success toast on successful email change request', async () => {
      const { toast } = await import('sonner');
      vi.mocked(requestEmailChange).mockResolvedValue({ success: true });

      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      await user.type(screen.getByLabelText(/new email/i), 'new@example.com');
      await user.type(
        screen.getByLabelText(/current password/i),
        'Password123!'
      );

      await user.click(screen.getByRole('button', { name: /email change/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Verification Email Sent',
          expect.objectContaining({
            description: expect.stringContaining('verification link'),
          })
        );
      });
    });

    it('should clear password field after successful request', async () => {
      vi.mocked(requestEmailChange).mockResolvedValue({ success: true });

      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      const emailInput = screen.getByLabelText(
        /new email/i
      ) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        /current password/i
      ) as HTMLInputElement;

      await user.type(emailInput, 'new@example.com');
      await user.type(passwordInput, 'Password123!');

      await user.click(screen.getByRole('button', { name: /email change/i }));

      await waitFor(() => {
        // Password should be cleared for security
        expect(passwordInput.value).toBe('');
        // Email should remain for user reference
        expect(emailInput.value).toBe('new@example.com');
      });
    });

    it('should show error toast on failure - incorrect password', async () => {
      const { toast } = await import('sonner');
      vi.mocked(requestEmailChange).mockResolvedValue({
        success: false,
        error: 'Incorrect password',
      });

      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      await user.type(screen.getByLabelText(/new email/i), 'new@example.com');
      await user.type(
        screen.getByLabelText(/current password/i),
        'WrongPassword123!'
      );

      await user.click(screen.getByRole('button', { name: /email change/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to Change Email',
          expect.objectContaining({
            description: expect.stringContaining('Incorrect password'),
          })
        );
      });
    });

    it('should show error toast on failure - rate limit', async () => {
      const { toast } = await import('sonner');
      vi.mocked(requestEmailChange).mockResolvedValue({
        success: false,
        error: 'Too many email change attempts. Try again in 45 minutes.',
      });

      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      await user.type(screen.getByLabelText(/new email/i), 'new@example.com');
      await user.type(
        screen.getByLabelText(/current password/i),
        'Password123!'
      );

      await user.click(screen.getByRole('button', { name: /email change/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to Change Email',
          expect.objectContaining({
            description: expect.stringContaining('Too many'),
          })
        );
      });
    });

    it('should show error toast on failure - email already in use', async () => {
      const { toast } = await import('sonner');
      vi.mocked(requestEmailChange).mockResolvedValue({
        success: false,
        error: 'This email is already in use by another account',
      });

      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      await user.type(
        screen.getByLabelText(/new email/i),
        'existing@example.com'
      );
      await user.type(
        screen.getByLabelText(/current password/i),
        'Password123!'
      );

      await user.click(screen.getByRole('button', { name: /email change/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to Change Email',
          expect.objectContaining({
            description: expect.stringContaining('already in use'),
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      expect(screen.getByLabelText(/new email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    });

    it('should have aria-invalid on fields with errors', async () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      await user.click(screen.getByRole('button', { name: /email change/i }));

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/new email/i);
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have descriptive button text', () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      expect(
        screen.getByRole('button', { name: /email change/i })
      ).toBeInTheDocument();
    });

    it('should have aria-label on toggle button', () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      const toggleButton = screen.getByRole('button', {
        name: /show password|hide password/i,
      });
      expect(toggleButton).toHaveAttribute('aria-label');
    });
  });

  describe('Loading States', () => {
    it('should disable button while submitting', async () => {
      vi.mocked(requestEmailChange).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      await user.type(screen.getByLabelText(/new email/i), 'new@example.com');
      await user.type(
        screen.getByLabelText(/current password/i),
        'Password123!'
      );

      const submitButton = screen.getByRole('button', {
        name: /email change/i,
      });
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });

    it('should show loading text while submitting', async () => {
      vi.mocked(requestEmailChange).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      await user.type(screen.getByLabelText(/new email/i), 'new@example.com');
      await user.type(
        screen.getByLabelText(/current password/i),
        'Password123!'
      );

      const submitButton = screen.getByRole('button', {
        name: /email change/i,
      });
      await user.click(submitButton);

      expect(screen.getByText(/requesting/i)).toBeInTheDocument();
    });
  });

  describe('Security', () => {
    it('should not expose password value in the DOM', () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      const passwordInput = screen.getByLabelText(/current password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should require password confirmation for email change', () => {
      renderWithProviders(<EmailChangeForm currentEmail="user@example.com" />, {
        disableTheme: true,
      });

      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    });
  });
});
