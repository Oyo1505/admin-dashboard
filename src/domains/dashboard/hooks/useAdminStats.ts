import { useQuery } from '@tanstack/react-query';
import { ADMIN_STATS_CACHE_TIME } from '@/shared/constants/analytics';

/**
 * Hook to fetch comprehensive admin dashboard statistics
 * @returns Admin dashboard statistics query
 */
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/admin-stats');

      if (!response.ok) {
        throw new Error('Failed to fetch admin statistics');
      }

      return response.json();
    },
    staleTime: ADMIN_STATS_CACHE_TIME,
  });
};

/**
 * Hook to fetch top movies by favorites count
 * @param limit - Maximum number of movies to return (optional)
 * @returns Top movies query
 */
export const useTopMovies = (limit?: number) => {
  return useQuery({
    queryKey: ['top-movies', limit],
    queryFn: async () => {
      const url = limit
        ? `/api/analytics/top-movies?limit=${limit}`
        : '/api/analytics/top-movies';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch top movies');
      }

      return response.json();
    },
    staleTime: ADMIN_STATS_CACHE_TIME,
  });
};

/**
 * Hook to fetch top users by visits count
 * @param limit - Maximum number of users to return (optional)
 * @returns Top users query
 */
export const useTopUsers = (limit?: number) => {
  return useQuery({
    queryKey: ['top-users', limit],
    queryFn: async () => {
      const url = limit
        ? `/api/analytics/top-users?limit=${limit}`
        : '/api/analytics/top-users';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch top users');
      }

      return response.json();
    },
    staleTime: ADMIN_STATS_CACHE_TIME,
  });
};

/**
 * Hook to fetch top genres by favorites count
 * @param limit - Maximum number of genres to return (optional)
 * @returns Top genres query
 */
export const useTopGenres = (limit?: number) => {
  return useQuery({
    queryKey: ['top-genres', limit],
    queryFn: async () => {
      const url = limit
        ? `/api/analytics/top-genres?limit=${limit}`
        : '/api/analytics/top-genres';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch top genres');
      }

      return response.json();
    },
    staleTime: ADMIN_STATS_CACHE_TIME,
  });
};

/**
 * Hook to fetch recent activity (new users and movies)
 * @param days - Number of days to look back (optional)
 * @returns Recent activity query
 */
export const useRecentActivity = (days?: number) => {
  return useQuery({
    queryKey: ['recent-activity', days],
    queryFn: async () => {
      const url = days
        ? `/api/analytics/recent-activity?days=${days}`
        : '/api/analytics/recent-activity';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch recent activity');
      }

      return response.json();
    },
    staleTime: ADMIN_STATS_CACHE_TIME,
  });
};
