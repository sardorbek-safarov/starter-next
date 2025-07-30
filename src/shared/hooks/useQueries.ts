import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../lib/http-client';
import { useToast } from './useToast';

// Example: User profile queries
export const userKeys = {
  all: ['users'] as const,
  profile: (userId: string) => [...userKeys.all, 'profile', userId] as const,
  settings: () => [...userKeys.all, 'settings'] as const,
};

// Get user profile
export function useUserProfile(userId: string) {
  const { showGenericError } = useToast();

  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: async () => {
      const response = await httpClient.get(`/api/users/${userId}`);
      if (response.status >= 400) {
        showGenericError();
        throw new Error('Failed to fetch user profile');
      }
      return response.data;
    },
    enabled: !!userId, // Only run if userId exists
  });
}

// Update user profile
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { showGenericError, showSuccess } = useToast();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const response = await httpClient.put(`/api/users/${userId}`, data);
      if (response.status >= 400) {
        throw new Error(response.data?.message || 'Failed to update profile');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the cache with the new data
      queryClient.setQueryData(userKeys.profile(variables.userId), data);
      showSuccess('Profile updated successfully');

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      showGenericError();
    },
  });
}

// Example: Dashboard data queries
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  activities: (page: number) =>
    [...dashboardKeys.all, 'activities', page] as const,
};

// Get dashboard statistics
export function useDashboardStats() {
  const { showGenericError } = useToast();

  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const response = await httpClient.get('/api/dashboard/stats');
      if (response.status >= 400) {
        showGenericError();
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}

// Get user activities with pagination
export function useUserActivities(page = 1, pageSize = 10) {
  const { showGenericError } = useToast();

  return useQuery({
    queryKey: dashboardKeys.activities(page),
    queryFn: async () => {
      const response = await httpClient.get(
        `/api/dashboard/activities?page=${page}&pageSize=${pageSize}`
      );
      if (response.status >= 400) {
        showGenericError();
        throw new Error('Failed to fetch activities');
      }
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
}
