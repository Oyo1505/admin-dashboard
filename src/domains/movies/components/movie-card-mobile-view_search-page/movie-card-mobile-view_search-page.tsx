'use client';
import { Favorite } from '@/domains/ui/components/icons/icons';
import { IMovie } from '@/models/movie/movie';
import { IUser } from '@/models/user/user';
import { URL_MOVIE_ID } from '@/shared/route';
import { minutesToHours } from '@/shared/utils/number/minutesToHours';
import isFavorite from '@/shared/utils/string/isUserFavoriteMovie';
import { titleOnlocale } from '@/shared/utils/string/titleOnlocale';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Activity } from 'react';

interface IMovieCardSearchPage {
  movie: IMovie;
  user?: IUser;
  priority?: boolean;
}
const MovieCardSearchPageMobileView = ({
  movie,
  user,
  priority = false,
}: IMovieCardSearchPage) => {
  const locale = useLocale();
  return (
    <Link
      prefetch
      className="w-full h-28 bg-neutral-700 rounded-lg flex flex-row relative transition-all duration-300"
      href={`${URL_MOVIE_ID(movie?.id)}`}
      key={movie?.id}
    >
      <Activity
        mode={isFavorite({ id: movie?.id, user }) ? 'visible' : 'hidden'}
      >
        <div className="absolute z-1 top-1 right-1">
          <Favorite fill />
        </div>
      </Activity>

      <div className="min-w-24 h-full rounded-lg relative overflow-hidden">
        <Image
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          className="w-full h-full rounded-lg transform transition-transform object-cover duration-300 group-hover:scale-110"
          src={movie?.image ? movie?.image : 'imageDefault'}
          width={300}
          height={200}
          sizes="(max-width: 640px) 96px, (max-width: 768px) 96px, 96px"
          alt={movie?.title || 'Movie Image'}
        />
      </div>
      <div className="flex flex-col justify-start p-2 h-full">
        <h3 className="font-semibold text-white line-clamp-1">
          {titleOnlocale(movie, locale)}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2">{movie?.synopsis}</p>
        <p className="text-sm text-gray-400 mt-auto">
          {`${movie?.year}`}
          {movie?.duration && ` • ${minutesToHours(movie?.duration)}`}
        </p>
      </div>
    </Link>
  );
};
export default MovieCardSearchPageMobileView;
