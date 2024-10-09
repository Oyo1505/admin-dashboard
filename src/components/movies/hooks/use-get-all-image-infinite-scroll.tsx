import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchMovies } from '../action';


const fetchMoviesParams = async ({ pageParam = 12, search = '' }) =>  await fetchMovies({pageParam, search});

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
    getNextPageParam: (lastPage) => {
      if (lastPage.prevOffset && lastPage.prevOffset > lastPage.movies?.length) {
        return undefined;
      }
      return lastPage.prevOffset && lastPage.prevOffset + 12; 
    },
  })

  return {data, error, hasNextPage, isFetching, status, fetchNextPage, isFetchingNextPage, refetch}
}

export { useGetMoviesInfiniteScroll }