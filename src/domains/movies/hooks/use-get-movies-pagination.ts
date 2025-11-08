import { keepPreviousData, useQuery } from '@tanstack/react-query';

const useGetMoviesPagination = ({ page }: { page: number }) => {
  const { data, isPlaceholderData } = useQuery({
    queryKey: ['get-all-movies-pagination', page],
    queryFn: async () => {
      const response = await fetch(
        `/api/movies/get-movies-paginated?pageParam=${page * 5}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch movies paginated');
      }
      return response.json();
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  return { data, isPlaceholderData };
};

export default useGetMoviesPagination;
