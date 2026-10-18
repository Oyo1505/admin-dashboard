import {
  IAdminMoviesQuery,
  IAdminMoviesResponse,
} from '@/models/movie/movie-filters';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

const fetchAdminMovies = async ({
  page,
  search = '',
  publish = 'all',
}: IAdminMoviesQuery): Promise<IAdminMoviesResponse> => {
  const params = new URLSearchParams({ page: String(page), search, publish });
  const response = await fetch(`/api/movies/get-movies-paginated?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch movies paginated');
  }
  return response.json();
};

const useGetMoviesPagination = ({
  page,
  search = '',
  publish = 'all',
}: IAdminMoviesQuery) => {
  const { data, isPlaceholderData, isFetching, isError } = useQuery({
    queryKey: ['all-movies-pagination', page, search, publish],
    staleTime: 60 * 1000,
    queryFn: () => fetchAdminMovies({ page, search, publish }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  return { data, isPlaceholderData, isFetching, isError };
};

export default useGetMoviesPagination;
