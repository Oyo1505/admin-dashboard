import { useMovieFormStore } from '@/store/movie/movie-store';
import { useInfiniteQuery } from '@tanstack/react-query';
import { cache, useEffect } from 'react';
import { fetchMovies } from '../actions/movies';

export const fetchMoviesParams = cache(
  async ({ pageParam = 12, search = '' }) => {
    return await fetchMovies({ pageParam, search });
  }
);

const useGetMoviesInfiniteScroll = ({
  pageParam,
  search,
}: {
  pageParam?: number;
  search?: string;
}) => {
  const { setMoviesStore } = useMovieFormStore();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['movies', search, pageParam],
    queryFn: ({ pageParam }) => fetchMoviesParams({ pageParam, search }),
    initialPageParam: pageParam,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => {
      if (
        lastPage.prevOffset &&
        lastPage.prevOffset > (lastPage.movies?.length ?? 0)
      ) {
        return undefined;
      }
      return lastPage.prevOffset && lastPage.prevOffset + 12;
    },
  });

  const firstPageMovies = data?.pages?.[0]?.movies;
  useEffect(() => {
    if (firstPageMovies && !isRefetching) {
      setMoviesStore(firstPageMovies);
    }
  }, [firstPageMovies, isRefetching, setMoviesStore]);

  return {
    data,
    error,
    hasNextPage,
    isFetching,
    status,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  };
};

export { useGetMoviesInfiniteScroll };
