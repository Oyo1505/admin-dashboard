'use client';
import { IMovie } from '@/models/movie/movie';
import { URL_MOVIE_ID } from '@/shared/route';
import { titleOnlocale } from '@/shared/utils/string/titleOnlocale';
import Image from 'next/image';
import Link from 'next/link';

const MovieItemCarousel = ({
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
      <div
        className={`group relative flex w-28 md:w-44 lg:w-60 rounded-lg flex-col justify-between h-full`}
      >
        <div className="w-full rounded-lg h-full relative overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              priority
              src={image}
              alt={`poster-${movie?.title}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full h-full rounded-lg transform transition-transform duration-300 group-hover:scale-110"
              width={300}
              height={200}
            />
          </div>
          <div className="absolute inset-0 rounded-lg group-hover:bg-background group-hover:opacity-95"></div>
        </div>
        <div className="absolute pr-2 pl-2 inset-0 flex text-center items-center justify-center text-lg font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity [text-shadow:0_2px_8px_rgb(0_0_0/80%)]">
          {titleOnlocale(movie, locale)}
        </div>
      </div>
    </Link>
  );
};

export default MovieItemCarousel;
