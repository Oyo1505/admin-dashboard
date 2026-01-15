'use client';
import { Favorite } from '@/domains/ui/components/icons/icons';
import { IMovie } from '@/models/movie/movie';
import { URL_MOVIE_ID } from '@/shared/route';
import { titleOnlocale } from '@/shared/utils/string/titleOnlocale';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Activity } from 'react';

interface IMovieCardSearchPage {
  movie: IMovie;
  user?: {
    favoriteMovies?: { movieId: string }[];
  } | null;
  priority?: boolean;
}

const MovieCardSearchPage = ({
  movie,
  user,
  priority = false,
}: IMovieCardSearchPage) => {
  const locale = useLocale();
  const isFavorite = (id: string) => {
    return user?.favoriteMovies?.some(
      (favoriteMovie) => favoriteMovie.movieId === id
    );
  };
  return (
    <Link
      prefetch
      className="hidden w-full h-28 rounded-lg md:rounded-none md:bg-inherit md:w-52 relative group md:flex md:h-full flex-col gap-3 md:justify-start md:items-center md:pb-5"
      href={`${URL_MOVIE_ID(movie?.id)}`}
      key={`${movie?.id}-link`}
    >
      <Activity mode={isFavorite(movie?.id) ? 'visible' : 'hidden'}>
        <div className="absolute z-1 top-1 right-1">
          <Favorite fill />
        </div>
      </Activity>

      <div className="flex relative w-full rounded-lg flex-col justify-between h-full">
        <div className="w-24 h-full md:w-full md:h-72 rounded-lg relative overflow-hidden">
          <Image
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            className="w-full h-full rounded-lg transform transition-transform duration-300 group-hover:scale-110"
            src={movie?.image ? movie?.image : 'imageDefault'}
            width={300}
            height={200}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 16.66vw"
            alt={
              `Affiche du film ${titleOnlocale(movie, locale)}` ||
              `Affiche du film ${movie?.title}`
            }
          />
        </div>
      </div>

      <div className="w-full text-center text-ellipsis whitespace-nowrap overflow-hidden">
        {titleOnlocale(movie, locale)}
      </div>
    </Link>
  );
};
export default MovieCardSearchPage;
