import { useQuery } from '@tanstack/react-query';
import { USER_STATS_CACHE_TIME } from '@/shared/constants/analytics';

/**
 * Hook to fetch user statistics
 * @param userId - User ID to fetch stats for
 * @returns User statistics query
 */
export const useUserStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await fetch(`/api/analytics/user-stats/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch user statistics');
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: USER_STATS_CACHE_TIME,
  });
};
