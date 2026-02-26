import { useQuery } from '@tanstack/react-query';
const useGetMoviesFromGoogleDrive = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies-from-google-drive'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch(`/api/movies/get-movies-from-google-drive`);
      if (!response.ok) {
        return [];
      }
      const { filteredMoviesNotAdded } = await response.json();

      return filteredMoviesNotAdded ?? [];
    },
  });

  return { data, isLoading, error };
};

export default useGetMoviesFromGoogleDrive;
