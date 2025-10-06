import { useGenreStore } from '@/store/movie/movie-store';
import { useEffect } from 'react';
import { getAllGenres } from '../actions/genres';

const useInitGenreStore = () => {
  const { genres, setGenres } = useGenreStore();

  useEffect(() => {
    if (genres.length === 0) {
      getAllGenres().then(({ genres: fetchedGenres }) => {
        if (fetchedGenres) {
          setGenres(fetchedGenres);
        }
      });
    }
  }, [genres.length, setGenres]);
  return genres;
};

export default useInitGenreStore;
