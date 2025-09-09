import { IMovie } from '@/models/movie/movie';
import { URL_MOVIE_ID } from '@/shared/route';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { titleOnlocale } from 'utilities/string/titleOnlocale';

const MovieItemTheme = memo(
  ({
    image,
    locale,
    movie,
    id,
  }: {
    image: string;
    locale: string;
    movie: IMovie;
    id: string;
  }) => {
    return (
      <Link href={URL_MOVIE_ID(id)}>
        <div className="group flex h-56 relative w-28 md:w-44 lg:w-80 rounded-lg  flex-col justify-between ">
          <div className="w-full rounded-lg h-full relative overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                priority
                src={image}
                alt={movie?.title}
                className="w-full h-full rounded-lg object-cover transform transition-transform duration-300 group-hover:scale-110"
                width={300}
                height={200}
              />
            </div>
            <div className="absolute inset-0 rounded-lg group-hover:bg-background group-hover:opacity-50"></div>
          </div>
          <div className="absolute pr-2 pl-2 inset-0 flex text-center items-center  justify-center text-lg font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {titleOnlocale(movie, locale)}
          </div>
        </div>
      </Link>
    );
  }
);
MovieItemTheme.displayName = 'MovieItemTheme';
export default MovieItemTheme;
