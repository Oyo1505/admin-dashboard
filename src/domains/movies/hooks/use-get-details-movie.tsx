import { useQuery } from '@tanstack/react-query';

const useGetDetailsMovie = ({
  id,
  language,
}: {
  id: string;
  language: string;
}) => {
  const { data } = useQuery({
    queryKey: ['movieDetails', id, language],
    enabled: !!id,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch(`/api/tmdb/${id}?language=${language}`);
      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }
      return response.json();
    },
  });

  return { data };
};

export default useGetDetailsMovie;
