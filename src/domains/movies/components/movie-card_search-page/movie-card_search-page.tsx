'use client';
import { Favorite } from '@/domains/ui/components/icons/icons';
import { IMovie } from '@/models/movie/movie';
import { URL_MOVIE_ID } from '@/shared/route';
import { titleOnlocale } from '@/shared/utils/string/titleOnlocale';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';

interface IMovieCardSearchPage {
  movie: IMovie;
  user?: {
    favoriteMovies?: { movieId: string }[];
  } | null;
}

const MovieCardSearchPage = memo(({ movie, user }: IMovieCardSearchPage) => {
  const locale = useLocale();
  const isFavorite = (id: string) => {
    return user?.favoriteMovies?.some(
      (favoriteMovie) => favoriteMovie.movieId === id
    );
  };
  return (
    <Link
      prefetch
      className="hidden w-full h-28 rounded-lg md:rounded-none md:bg-inherit md:w-52 relative group md:flex md:h-full flex-col gap-3 md:justify-start md:items-center transition-all duration-300 md:pb-5"
      href={`${URL_MOVIE_ID(movie?.id)}`}
      key={`${movie?.id}-link`}
    >
      {isFavorite(movie?.id) && (
        <div className="absolute z-1 top-1 right-1">
          <Favorite fill />
        </div>
      )}
      <div className="flex relative w-full rounded-lg flex-col justify-between h-full">
        <div className="w-24 h-full md:w-full md:h-72 rounded-lg relative overflow-hidden">
          <Image
            priority
            className="w-full h-full rounded-lg transform transition-transform duration-300 group-hover:scale-110"
            src={movie?.image ? movie?.image : 'imageDefault'}
            width={300}
            height={200}
            alt={
              titleOnlocale(movie, locale) || `Affiche du film ${movie?.title}`
            }
          />
        </div>
      </div>

      <div className="w-full text-center text-ellipsis whitespace-nowrap overflow-hidden">
        {titleOnlocale(movie, locale)}
      </div>
    </Link>
  );
});
MovieCardSearchPage.displayName = 'MovieCardSearchPage';
export default MovieCardSearchPage;
