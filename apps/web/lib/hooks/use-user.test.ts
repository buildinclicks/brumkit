import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { createTestQueryClient } from '@/lib/test/render';
import {
  useCurrentUser,
  useUserProfile,
  useUpdateProfile,
  useDeleteAccount,
  useUploadAvatar,
  useUserStats,
} from './use-user';

import type { ReactNode } from 'react';

// next-auth/react and @/app/actions are globally mocked in vitest.setup.ts.

vi.mock('@/app/actions', () => ({
  getCurrentUserProfile: vi.fn(),
  getUserProfile: vi.fn(),
  getUserStats: vi.fn(),
  updateUserProfile: vi.fn(),
  deleteAccount: vi.fn(),
}));

// Mock fetch for useUploadAvatar
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function wrapper({ children }: { children: ReactNode }) {
  const qc = createTestQueryClient();
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('useCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when unauthenticated', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return the current user when authenticated', () => {
    const mockUser = { id: 'u1', email: 'test@example.com', name: 'Alice' };
    vi.mocked(useSession).mockReturnValue({
      data: { user: mockUser, expires: '' },
      status: 'authenticated',
      update: vi.fn(),
    });

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should return isLoading true while session is loading', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn(),
    });

    const { result } = renderHook(() => useCurrentUser(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });
});

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });
  });

  it('should fetch user profile when userId is provided', async () => {
    const mockProfile = { id: 'u1', name: 'Alice', email: 'a@b.com' };
    const { getUserProfile } = await import('@/app/actions');
    vi.mocked(getUserProfile).mockResolvedValue({
      success: true,
      data: mockProfile as any,
    });

    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    const { result } = renderHook(() => useUserProfile('u1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProfile);
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useUserProfile('u1'), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state when profile fetch fails', async () => {
    const { getUserProfile } = await import('@/app/actions');
    vi.mocked(getUserProfile).mockResolvedValue({
      success: false,
      error: 'Not found',
    });

    const { result } = renderHook(() => useUserProfile('u1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUpdateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'u1', email: 'a@b.com' }, expires: '' },
      status: 'authenticated',
      update: vi.fn(),
    });
  });

  it('should start in idle state before mutation fires', () => {
    const { result } = renderHook(() => useUpdateProfile(), { wrapper });
    expect(result.current.status).toBe('idle');
  });

  it('should call updateUserProfile and return data on success', async () => {
    const { updateUserProfile } = await import('@/app/actions');
    vi.mocked(updateUserProfile).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ name: 'Alice', username: 'alice', bio: '', image: '' })
        .catch(() => {});
    });

    expect(updateUserProfile).toHaveBeenCalled();
  });

  it('should throw with fieldErrors when update fails', async () => {
    const { updateUserProfile } = await import('@/app/actions');
    vi.mocked(updateUserProfile).mockResolvedValue({
      success: false,
      error: 'username taken',
      fieldErrors: { username: 'This username is already taken' },
    });

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    let caughtError: Error & { fieldErrors?: Record<string, string> } =
      new Error();
    await act(async () => {
      try {
        await result.current.mutateAsync({
          name: 'Alice',
          username: 'taken',
          bio: '',
          image: '',
        });
      } catch (err) {
        caughtError = err as typeof caughtError;
      }
    });

    expect(caughtError.fieldErrors).toEqual({
      username: 'This username is already taken',
    });
  });
});

describe('useUploadAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'u1', email: 'a@b.com' }, expires: '' },
      status: 'authenticated',
      update: vi.fn(),
    });
  });

  it('should start in idle state', () => {
    const { result } = renderHook(() => useUploadAvatar(), { wrapper });
    expect(result.current.status).toBe('idle');
  });

  it('should call /api/user/avatar with FormData on mutate', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi
        .fn()
        .mockResolvedValue({ url: 'https://example.com/avatar.png' }),
    });

    const { result } = renderHook(() => useUploadAvatar(), { wrapper });
    const file = new File(['content'], 'avatar.png', { type: 'image/png' });

    await act(async () => {
      await result.current.mutateAsync(file).catch(() => {});
    });

    // fetch was called once
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should throw when upload fails', async () => {
    mockFetch.mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useUploadAvatar(), { wrapper });
    const file = new File(['content'], 'avatar.png', { type: 'image/png' });

    let threw = false;
    await act(async () => {
      try {
        await result.current.mutateAsync(file);
      } catch {
        threw = true;
      }
    });

    expect(threw).toBe(true);
  });
});

describe('useUserStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });
  });

  it('should fetch user stats when userId is provided', async () => {
    const mockStats = { postCount: 5, followerCount: 10 };
    const { getUserStats } = await import('@/app/actions');
    vi.mocked(getUserStats).mockResolvedValue({
      success: true,
      data: mockStats as any,
    });

    const { result } = renderHook(() => useUserStats('u1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStats);
  });

  it('should throw when stats fetch fails', async () => {
    const { getUserStats } = await import('@/app/actions');
    vi.mocked(getUserStats).mockResolvedValue({
      success: false,
      error: 'Not found',
    });

    const { result } = renderHook(() => useUserStats('u1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useDeleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });
  });

  it('should start in idle state before mutation fires', () => {
    const { result } = renderHook(() => useDeleteAccount(), { wrapper });
    expect(result.current.status).toBe('idle');
  });

  it('should call deleteAccount action on mutate', async () => {
    const { deleteAccount } = await import('@/app/actions');
    vi.mocked(deleteAccount).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('Password123!').catch(() => {});
    });

    expect(deleteAccount).toHaveBeenCalledWith({ password: 'Password123!' });
  });

  it('should throw when deletion fails', async () => {
    const { deleteAccount } = await import('@/app/actions');
    vi.mocked(deleteAccount).mockResolvedValue({
      success: false,
      error: 'password.incorrect',
    });

    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    let threw = false;
    await act(async () => {
      try {
        await result.current.mutateAsync('wrong');
      } catch {
        threw = true;
      }
    });

    expect(threw).toBe(true);
  });
});
