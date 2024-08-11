import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchMovies } from '../action';


const fetchMoviesParams = async ({ pageParam = 5 }) =>  await fetchMovies({pageParam});

const useGetMoviesInfiniteScrool = (pageParam?:number) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['movies', pageParam],
    queryFn: ({ pageParam }) => fetchMoviesParams({pageParam}),
    initialPageParam: pageParam,
    getNextPageParam: (lastPage) => {
      if (lastPage.prevOffset && lastPage.prevOffset > lastPage.movies?.length) {
        return undefined;
      }
      return lastPage.prevOffset && lastPage.prevOffset + 5; 
    },
  })

  return {data, error, hasNextPage, isFetching, status, fetchNextPage,isFetchingNextPage}
}

export { useGetMoviesInfiniteScrool, fetchMoviesParams }