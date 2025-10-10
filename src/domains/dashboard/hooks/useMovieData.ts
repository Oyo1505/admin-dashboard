import { IMovie, IMovieFormData, IUpdateMovieData } from '@/models/movie/movie';
import { MovieSchema } from '@/shared/schema/movieSchema';
import { useQuery } from '@tanstack/react-query';
import { publishedMovieById } from '../actions/movie';

interface UseMovieDataProps {
  editMovie: boolean;
  movie?: IMovie;
}

interface UseMovieDataReturn {
  getDefaultValues: (
    movie?: IMovie, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
    idFromGoogleDrive?: string // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  ) => Partial<MovieSchema>;
  transformFormData: (
    data: MovieSchema // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  ) => IMovieFormData | IUpdateMovieData;
  getMoviePublish: ReturnType<typeof useQuery>;
}

export const useMovieData = ({
  editMovie,
  movie,
}: UseMovieDataProps): UseMovieDataReturn => {
  const getDefaultValues = (
    movie?: IMovie,
    idFromGoogleDrive?: string
  ): Partial<MovieSchema> => {
    return {
      id: movie?.id,
      title: movie?.title ?? '',
      originalTitle: movie?.originalTitle ?? '',
      titleJapanese: movie?.titleJapanese ?? '',
      titleEnglish: movie?.titleEnglish ?? '',
      director: movie?.director ?? '',
      imdbId: movie?.imdbId ?? '',
      link: movie?.link ?? '',
      year: movie?.year ?? new Date().getFullYear(),
      genresIds: movie?.genresIds?.map((item) => item.genre.id),
      trailer: movie?.trailer ?? '',
      duration: movie?.duration ?? 0,
      synopsis: movie?.synopsis ?? '',
      country: movie?.country ?? '',
      langage: movie?.language ?? '',
      subtitles: movie?.subtitles ?? [],
      idGoogleDive: movie?.idGoogleDive
        ? movie?.idGoogleDive
        : (idFromGoogleDrive ?? ''),
    };
  };

  const transformFormData = (
    data: MovieSchema
  ): IMovieFormData | IUpdateMovieData => {
    const baseData = {
      title: data.title,
      titleJapanese: data.titleJapanese,
      titleEnglish: data.titleEnglish,
      idGoogleDive: data.idGoogleDive,
      director: data.director,
      imdbId: data.imdbId,
      subtitles: data.subtitles,
      language: data.langage,
      originalTitle: data.originalTitle,
      genresIds: data?.genresIds,
      year: data.year,
      duration: data.duration,
      country: data.country,
      synopsis: data.synopsis,
      trailer: data.trailer,
      link: data.link,
    };

    if (editMovie && data.id) {
      return {
        ...baseData,
        id: data.id,
      } as IUpdateMovieData;
    }

    return baseData as IMovieFormData;
  };
  const getMoviePublish = useQuery({
    queryKey: ['moviePublish', movie?.id],
    enabled: false,
    queryFn: () =>
      movie?.id ? publishedMovieById(movie.id) : Promise.resolve(undefined),
  });

  return {
    getDefaultValues,
    transformFormData,
    getMoviePublish,
  };
};
