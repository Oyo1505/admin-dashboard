'use client'
import { IMovie } from '@/models/movie/movie'
import { URL_MOVIE_ID } from '@/shared/route'
import Image from 'next/image'
import Link from 'next/link'
import { titleOnlocale } from 'utilities/string/titleOnlocale'

const MovieItemCarousel = ({image, locale, movie, id }: {image: string, locale: string, movie: IMovie, id: string}) => {
  return (
    <Link href={URL_MOVIE_ID(id)} >
    <div className={`group relative flex  w-28 md:w-44 lg:w-64 rounded-lg  flex-col justify-between h-full`}>
        <div className='w-full rounded-lg h-full relative overflow-hidden'>
          <div className='relative w-full h-full'>
            <Image
              priority
              src={image}
              alt={movie?.title}
              className='w-full h-full rounded-lg transform transition-transform duration-300 group-hover:scale-110'
              width={300}
              height={200}
            />
          </div>
          <div className='absolute inset-0 rounded-lg group-hover:bg-background k group-hover:opacity-50'></div>
        </div>
      <div className='absolute pr-2 pl-2 inset-0 flex text-center items-center  justify-center text-lg font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity'>{titleOnlocale(movie, locale)}</div>
    </div>
    </Link>
  )
}

export default MovieItemCarousel
