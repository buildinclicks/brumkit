import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { createTestQueryClient } from '@/lib/test/render';
import { useServerActionForm } from './use-server-action-form';

import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  const qc = createTestQueryClient();
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

type TestFields = { email: string; password: string };

function renderTestHook(
  serverAction: (data: TestFields) => Promise<any>,
  onSuccess?: (data: unknown) => void,
  onError?: (error: Error) => void
) {
  return renderHook(
    () => {
      const { setError } = useForm<TestFields>();
      return useServerActionForm(serverAction, {
        setError,
        onSuccess,
        onError,
      });
    },
    { wrapper }
  );
}

describe('useServerActionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call server action on submit', async () => {
    const action = vi.fn().mockResolvedValue({ success: true });

    const { result } = renderTestHook(action);

    await act(async () => {
      await result.current.mutateAsync({
        email: 'user@example.com',
        password: 'Password123!',
      });
    });

    expect(action).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Password123!',
    });
  });

  it('should show success state when server action succeeds', async () => {
    const action = vi.fn().mockResolvedValue({ success: true, data: 'ok' });
    const onSuccess = vi.fn();

    const { result } = renderTestHook(action, onSuccess);

    await act(async () => {
      await result.current.mutateAsync({
        email: 'user@example.com',
        password: 'Password123!',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(onSuccess).toHaveBeenCalledWith('ok');
  });

  it('should display field errors on failure', async () => {
    const action = vi.fn().mockResolvedValue({
      success: false,
      error: 'Validation failed',
      fieldErrors: { email: 'Email is already taken' },
    });

    const { result } = renderHook(
      () => {
        const form = useForm<TestFields>();
        // Explicitly read errors to subscribe to error state changes
        const errors = form.formState.errors;
        const mutation = useServerActionForm(action, {
          setError: form.setError,
        });
        return { mutation, errors };
      },
      { wrapper }
    );

    await act(async () => {
      // mutateAsync re-throws on failure; swallow to let onError handler run
      await result.current.mutation
        .mutateAsync({
          email: 'taken@example.com',
          password: 'Password123!',
        })
        .catch(() => {});
    });

    await waitFor(() => {
      expect(result.current.errors.email?.message).toBe(
        'Email is already taken'
      );
    });
  });

  it('should call onError for non-field server errors', async () => {
    const action = vi.fn().mockResolvedValue({
      success: false,
      error: 'Internal server error',
    });
    const onError = vi.fn();

    const { result } = renderTestHook(action, undefined, onError);

    await act(async () => {
      await result.current
        .mutateAsync({
          email: 'user@example.com',
          password: 'Password123!',
        })
        .catch(() => {});
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('should not call onError when there are field-level errors', async () => {
    const action = vi.fn().mockResolvedValue({
      success: false,
      error: 'Validation failed',
      fieldErrors: { email: 'Invalid email' },
    });
    const onError = vi.fn();

    const { result } = renderTestHook(action, undefined, onError);

    await act(async () => {
      await result.current
        .mutateAsync({
          email: 'bad',
          password: 'Password123!',
        })
        .catch(() => {});
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).not.toHaveBeenCalled();
  });
});
