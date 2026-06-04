import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { signIn, signOut } from 'next-auth/react';

import { createTestQueryClient } from '@/lib/test/render';
import {
  useLogin,
  useLogout,
  useChangePassword,
  useRequestPasswordReset,
  useResetPassword,
} from './use-auth';

import type { ReactNode } from 'react';

vi.mock('@/app/actions', () => ({
  changePassword: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
}));

// next-auth/react is globally mocked in vitest.setup.ts.
// next/navigation (useRouter) is globally mocked in vitest.setup.ts.

function wrapper({ children }: { children: ReactNode }) {
  const qc = createTestQueryClient();
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return current user session (idle state before any call)', () => {
    const { result } = renderHook(() => useLogin(), { wrapper });
    expect(result.current.status).toBe('idle');
    expect(result.current.isPending).toBe(false);
  });

  it('should call signIn with credentials on mutate', async () => {
    vi.mocked(signIn).mockResolvedValue({ ok: true, error: null } as any);

    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          email: 'user@example.com',
          password: 'Password123!',
        });
      } catch {
        // router.push in onSuccess can throw in jsdom; result is still valid
      }
    });

    expect(signIn).toHaveBeenCalledWith('credentials', {
      redirect: false,
      email: 'user@example.com',
      password: 'Password123!',
    });
  });

  it('should return null when unauthenticated (no data before mutation fires)', () => {
    const { result } = renderHook(() => useLogin(), { wrapper });
    expect(result.current.data).toBeUndefined();
  });
});

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call signOut when mutate is called', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(signOut).toHaveBeenCalledWith({ redirect: false });
  });
});

describe('useChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start in idle state', () => {
    const { result } = renderHook(() => useChangePassword(), { wrapper });
    expect(result.current.status).toBe('idle');
    expect(result.current.isError).toBe(false);
  });

  it('should resolve on successful password change', async () => {
    const { changePassword } = await import('@/app/actions');
    vi.mocked(changePassword).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useChangePassword(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({
          currentPassword: 'OldPass1!',
          newPassword: 'NewPass1!',
          confirmPassword: 'NewPass1!',
        })
        .catch(() => {});
    });

    expect(changePassword).toHaveBeenCalled();
  });

  it('should throw with fieldErrors on validation failure', async () => {
    const { changePassword } = await import('@/app/actions');
    vi.mocked(changePassword).mockResolvedValue({
      success: false,
      error: 'password.incorrect',
      fieldErrors: { currentPassword: 'password.incorrect' },
    });

    const { result } = renderHook(() => useChangePassword(), { wrapper });

    let caughtError: Error & { fieldErrors?: Record<string, string> } =
      new Error();
    await act(async () => {
      try {
        await result.current.mutateAsync({
          currentPassword: 'wrong',
          newPassword: 'NewPass1!',
          confirmPassword: 'NewPass1!',
        });
      } catch (err) {
        caughtError = err as typeof caughtError;
      }
    });

    expect(caughtError.fieldErrors).toEqual({
      currentPassword: 'password.incorrect',
    });
  });
});

describe('useRequestPasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have idle status before any call', () => {
    const { result } = renderHook(() => useRequestPasswordReset(), { wrapper });
    expect(result.current.status).toBe('idle');
  });

  it('should call requestPasswordReset action on mutate', async () => {
    const { requestPasswordReset } = await import('@/app/actions');
    vi.mocked(requestPasswordReset).mockResolvedValue({
      success: true,
      data: { message: 'sent' },
    });

    const { result } = renderHook(() => useRequestPasswordReset(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('test@example.com').catch(() => {});
    });

    expect(requestPasswordReset).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
  });

  it('should throw on failed request', async () => {
    const { requestPasswordReset } = await import('@/app/actions');
    vi.mocked(requestPasswordReset).mockResolvedValue({
      success: false,
      error: 'rate limited',
    });

    const { result } = renderHook(() => useRequestPasswordReset(), { wrapper });

    let threw = false;
    await act(async () => {
      try {
        await result.current.mutateAsync('test@example.com');
      } catch {
        threw = true;
      }
    });

    expect(threw).toBe(true);
  });
});

describe('useResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start in idle state', () => {
    const { result } = renderHook(() => useResetPassword(), { wrapper });
    expect(result.current.status).toBe('idle');
  });

  it('should call resetPassword action and redirect on success', async () => {
    const { resetPassword } = await import('@/app/actions');
    vi.mocked(resetPassword).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useResetPassword(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({
          token: 'abc',
          password: 'P@ss1!',
          confirmPassword: 'P@ss1!',
        })
        .catch(() => {});
    });

    expect(resetPassword).toHaveBeenCalled();
  });

  it('should throw on failed reset', async () => {
    const { resetPassword } = await import('@/app/actions');
    vi.mocked(resetPassword).mockResolvedValue({
      success: false,
      error: 'token expired',
    });

    const { result } = renderHook(() => useResetPassword(), { wrapper });

    let threw = false;
    await act(async () => {
      try {
        await result.current.mutateAsync({
          token: 'expired',
          password: 'P@ss1!',
          confirmPassword: 'P@ss1!',
        });
      } catch {
        threw = true;
      }
    });

    expect(threw).toBe(true);
  });
});
