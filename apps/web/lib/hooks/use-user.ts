import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import {
  deleteAccount,
  getCurrentUserProfile,
  getUserProfile,
  getUserStats,
  type UserProfile,
  updateUserProfile,
} from '@/app/actions';

import { queryKeys } from './query-keys';

import type { UpdateUserProfileInput } from '@repo/validation';

/**
 * Hook to get current authenticated user from session
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
  };
}

/**
 * Hook to get full user profile (with additional fields from DB)
 */
export function useUserProfile(
  userId?: string,
  options?: Omit<UseQueryOptions<UserProfile>, 'queryKey' | 'queryFn'>
) {
  const { user } = useCurrentUser();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: queryKeys.user.profile(targetUserId || ''),
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error('User ID is required');
      }

      const result =
        targetUserId === user?.id
          ? await getCurrentUserProfile()
          : await getUserProfile(targetUserId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !!targetUserId && (options?.enabled ?? true),
    ...options,
  });
}

/**
 * Hook to update current user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (data: UpdateUserProfileInput) => {
      const result = await updateUserProfile(data);

      if (!result.success) {
        const error = new Error(result.error) as Error & {
          fieldErrors?: Record<string, string>;
        };
        error.fieldErrors = result.fieldErrors;
        throw error;
      }

      return result.data;
    },
    onSuccess: (updatedUser) => {
      // Update the user profile cache
      if (user?.id) {
        queryClient.setQueryData(queryKeys.user.profile(user.id), updatedUser);
      }
      // Invalidate all user queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}

/**
 * Hook to delete user account
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      const result = await deleteAccount({ password });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
}

/**
 * Hook to upload user avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      return response.json() as Promise<{ url: string }>;
    },
    onSuccess: () => {
      // Update user profile with new avatar URL
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.user.profile(user.id),
        });
      }
    },
  });
}

/**
 * Hook to get user statistics
 */
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: [...queryKeys.user.byId(userId), 'stats'],
    queryFn: async () => {
      const result = await getUserStats(userId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !!userId,
  });
}
