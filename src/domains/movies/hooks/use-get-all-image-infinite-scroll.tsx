import { useInfiniteQuery } from '@tanstack/react-query';
import { cache } from 'react';
import { fetchMovies } from '../action';


const fetchMoviesParams = cache(async ({ pageParam = 12, search = '' }) =>  await fetchMovies({pageParam, search}));

const useGetMoviesInfiniteScroll = ({pageParam, search}:{pageParam?:number, search?:string}) => {

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch
  } = useInfiniteQuery({
    queryKey: ['movies', pageParam],
    queryFn:  ({ pageParam }) =>  fetchMoviesParams({pageParam, search}),
    initialPageParam: pageParam,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => {
      if (lastPage.prevOffset && lastPage.prevOffset > (lastPage.movies?.length ?? 0)) {
        return undefined;
      }
      return lastPage.prevOffset && lastPage.prevOffset + 12;
    },
  })

  return {data, error, hasNextPage, isFetching, status, fetchNextPage, isFetchingNextPage, refetch}
}

export { useGetMoviesInfiniteScroll };
