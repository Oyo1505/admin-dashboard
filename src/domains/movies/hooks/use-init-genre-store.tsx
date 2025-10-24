'use client';
import { useGenreStore } from '@/store/movie/movie-store';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const useInitGenreStore = () => {
  const { genres, setGenres } = useGenreStore();

  const { data, isFetched } = useQuery({
    queryKey: ['allGenres'],
    refetchOnWindowFocus: false,
    enabled: genres.length === 0,
    queryFn: async () => {
      const response = await fetch(`/api/genres/get-all-genres`);
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      const { genres } = await response.json();

      return genres;
    },
  });
  useEffect(() => {
    if (genres.length === 0 && isFetched) {
      setGenres(data ?? []);
    }
  }, [genres.length, setGenres, isFetched, data]);

  return genres;
};

export default useInitGenreStore;
