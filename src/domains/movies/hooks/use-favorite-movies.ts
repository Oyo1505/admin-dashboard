import { getFavoriteMovies } from '@/domains/dashboard/actions/movie';
import { useQuery } from '@tanstack/react-query';

export const useFavoriteMovies = (userId?: string) => {
  return useQuery({
    queryKey: ['favorite-movies', userId],
    queryFn: async () => {
      if (!userId) return [];
      const result = await getFavoriteMovies(userId);
      return result.movies ?? [];
    },
    enabled: !!userId,
  });
};
