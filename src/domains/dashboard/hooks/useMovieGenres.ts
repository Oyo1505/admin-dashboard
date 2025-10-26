import { IGenre, IMovie } from '@/models/movie/movie';
import { MovieSchema } from '@/shared/schema/movieSchema';
import { useGenreStore } from '@/store/movie/movie-store';
import { useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';

interface UseMovieGenresProps {
  movie?: IMovie;
  setValue: UseFormSetValue<MovieSchema>;
}

interface UseMovieGenresReturn {
  genresMovie: IGenre[];
  handleGenreChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  handleGenreDelete: (id: string) => void; // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  availableGenres: IGenre[] | undefined;
}

export const useMovieGenres = ({
  movie,
  setValue,
}: UseMovieGenresProps): UseMovieGenresReturn => {
  const { genres } = useGenreStore();

  const [genresMovie, setGenresMovie] = useState<IGenre[]>(
    movie && movie?.genresIds && movie?.genresIds?.length > 0
      ? movie?.genresIds.map((item) => item.genre).flat()
      : ([] as IGenre[])
  );

  const setGenresValue = (newGenresMovie: IGenre[]) => {
    const genresIds = newGenresMovie.map((item) => item?.id);
    setValue('genresIds', genresIds);
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (genresMovie.find((item) => item.id === e.target.value)) return;

    const newGenreEntry = genres?.find((item) => item.id === e.target.value);

    if (!newGenreEntry) return;

    setGenresMovie((prevGenresMovie) => {
      if (!prevGenresMovie.some((genre) => genre.id === newGenreEntry.id)) {
        const newGenresMovie = [...prevGenresMovie, newGenreEntry];
        setGenresValue(newGenresMovie);
        return newGenresMovie;
      }
      return prevGenresMovie;
    });
  };

  const handleGenreDelete = (id: string) => {
    setGenresMovie((prevGenresMovie) => {
      const newGenresMovie = prevGenresMovie.filter((item) => item.id !== id);
      setGenresValue(newGenresMovie);
      return newGenresMovie;
    });
  };
  return {
    genresMovie,
    handleGenreChange,
    handleGenreDelete,
    availableGenres: genres,
  };
};
