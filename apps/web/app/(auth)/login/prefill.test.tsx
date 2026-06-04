import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/lib/test';
import LoginPage from './page';
import * as authHooks from '@/lib/hooks/use-auth';

// Mock search params
const mockGet = vi.fn();
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useSearchParams: () => ({
      get: mockGet,
    }),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
  };
});

// Mock auth hooks
vi.mock('@/lib/hooks/use-auth');

describe('LoginPage Prefilling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authHooks.useLogin).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it('should prefill email and password from search params', async () => {
    mockGet.mockImplementation((key) => {
      if (key === 'email') return 'test@example.com';
      if (key === 'password') return 'Password123!';
      return null;
    });

    renderWithProviders(<LoginPage />, { disableTheme: true });

    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        /^password$/i
      ) as HTMLInputElement;

      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('Password123!');
    });
  });

  it('should handle empty search params gracefully', async () => {
    mockGet.mockReturnValue(null);

    renderWithProviders(<LoginPage />, { disableTheme: true });

    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        /^password$/i
      ) as HTMLInputElement;

      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });
  });
});
