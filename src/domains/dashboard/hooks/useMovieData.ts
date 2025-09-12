import { IMovie } from '@/models/movie/movie';
import { MovieSchema } from '@/shared/schema/movieSchema';

interface UseMovieDataProps {
  editMovie: boolean;
}

interface UseMovieDataReturn {
  getDefaultValues: (
    movie?: IMovie,
    idFromGoogleDrive?: string
  ) => Partial<MovieSchema>;
  transformFormData: (
    data: MovieSchema
  ) => Omit<IMovie, 'genresIds'> & { genresIds: string[] };
}

export const useMovieData = ({
  editMovie,
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
      genresIds: movie?.genresIds?.map((item) => item.genre.id) ?? [],
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
  ): Omit<IMovie, 'genresIds'> & { genresIds: string[] } => {
    return {
      ...(editMovie && { id: data.id }),
      title: data.title,
      titleJapanese: data.titleJapanese,
      titleEnglish: data.titleEnglish,
      idGoogleDive: data.idGoogleDive,
      director: data.director,
      imdbId: data.imdbId,
      subtitles: data.subtitles,
      language: data.langage,
      originalTitle: data.originalTitle,
      genresIds: data?.genresIds || [],
      year: data.year,
      duration: data.duration,
      country: data.country,
      synopsis: data.synopsis,
      trailer: data.trailer,
      link: data.link,
    } as Omit<IMovie, 'genresIds'> & { genresIds: string[] };
  };

  return {
    getDefaultValues,
    transformFormData,
  };
};
