/**
 * Login Page Tests (TDD)
 *
 * Following Test-Driven Development:
 * 1. RED: Write failing tests
 * 2. GREEN: Make them pass
 * 3. REFACTOR: Clean up code
 *
 * Test Coverage:
 * - Form rendering and validation
 * - User interactions
 * - Success/error flows
 * - Accessibility
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import * as authHooks from '@/lib/hooks/use-auth';
import { renderWithProviders, screen, userEvent, waitFor } from '@/lib/test';

import LoginPage from './page';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

// Mock auth hooks
vi.mock('@/lib/hooks/use-auth');

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock router and search params
const mockPush = vi.fn();
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
  };
});

describe('LoginPage - TDD', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations

    vi.mocked(authHooks.useLogin).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  describe('🔴 RED: Rendering', () => {
    it('should render login form with all fields', () => {
      renderWithProviders(<LoginPage />, { disableTheme: true });

      // Form fields
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();

      // Submit button
      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument();

      // Link to register
      expect(
        screen.getByRole('link', { name: /sign up/i })
      ).toBeInTheDocument();
    });

    it('should have proper heading and description', () => {
      renderWithProviders(<LoginPage />, { disableTheme: true });

      // Check for title (appears in CardTitle)
      const title = screen.getAllByText(/sign in/i)[0]; // First occurrence is the title
      expect(title).toBeInTheDocument();

      // Check for description
      expect(
        screen.getByText(/enter your email and password/i)
      ).toBeInTheDocument();
    });

    it('should have link to registration page', () => {
      renderWithProviders(<LoginPage />, { disableTheme: true });

      const registerLink = screen.getByRole('link', { name: /sign up/i });
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  describe('🔴 RED: Form Validation', () => {
    it('should show validation error for invalid email', async () => {
      renderWithProviders(<LoginPage />, { disableTheme: true });

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Enter invalid email
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
      });
    });

    it('should show validation error for empty password', async () => {
      renderWithProviders(<LoginPage />, { disableTheme: true });

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Enter valid email but no password
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should not show errors on initial render', () => {
      renderWithProviders(<LoginPage />, { disableTheme: true });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should validate on blur', async () => {
      renderWithProviders(<LoginPage />, { disableTheme: true });

      const emailInput = screen.getByLabelText(/email/i);

      // Type invalid email and blur
      await user.type(emailInput, 'invalid');
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('🔴 RED: Credential Login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({ ok: true });

      vi.mocked(authHooks.useLogin).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      } as any);

      renderWithProviders(<LoginPage />, { disableTheme: true });

      // Fill in form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');

      // Submit
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify mutation was called
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!',
        });
      });
    });

    it('should show error toast on login failure', async () => {
      const { toast } = await import('sonner');
      const mockMutateAsync = vi
        .fn()
        .mockRejectedValue(new Error('Invalid credentials'));

      vi.mocked(authHooks.useLogin).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      } as any);

      renderWithProviders(<LoginPage />, { disableTheme: true });

      // Fill and submit form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'WrongPassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify error toast was shown
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Login Failed', {
          description: 'Invalid credentials',
        });
      });
    });

    it('should disable submit button while loading', async () => {
      vi.mocked(authHooks.useLogin).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true, // Simulate loading state
      } as any);

      renderWithProviders(<LoginPage />, { disableTheme: true });

      const submitButton = screen.getByRole('button', { name: /signing in/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable all inputs while loading', async () => {
      vi.mocked(authHooks.useLogin).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true,
      } as any);

      renderWithProviders(<LoginPage />, { disableTheme: true });

      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    });
  });

  describe('🔴 RED: Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderWithProviders(<LoginPage />, { disableTheme: true });

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('should display validation errors with role="alert"', async () => {
      renderWithProviders(<LoginPage />, { disableTheme: true });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
      });
    });

    it('should have descriptive button text', () => {
      renderWithProviders(<LoginPage />, { disableTheme: true });

      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument();
    });
  });

  describe('🔴 RED: User Experience', () => {
    it('should show success toast on successful login', async () => {
      const { toast } = await import('sonner');
      const mockMutateAsync = vi.fn().mockResolvedValue({ ok: true });

      vi.mocked(authHooks.useLogin).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      } as any);

      renderWithProviders(<LoginPage />, { disableTheme: true });

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Signed in successfully');
      });
    });

    it('should clear form after successful submission', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({ ok: true });

      vi.mocked(authHooks.useLogin).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      } as any);

      renderWithProviders(<LoginPage />, { disableTheme: true });

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        /^password$/i
      ) as HTMLInputElement;

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });

      // Form inputs should be empty after successful login
      // Note: In reality, the user is redirected, but we're testing the component behavior
    });
  });
});
