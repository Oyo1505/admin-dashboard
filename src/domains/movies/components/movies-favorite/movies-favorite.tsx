'use client'
import { IMovie } from '@/models/movie/movie';
import { URL_MOVIE_ID } from '@/shared/route';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import imageDefault from '../../../../assets/image/default-placeholder.png';


const MoviesFavorite = ({movies}:{movies?:IMovie[]}) => {
  const t = useTranslations('Dashboard')
  return (
      <div className='flex flex-row gap-4 mt-6 items-start flex-wrap justify-start'>
      {movies && movies?.length > 0 ? movies?.map((movie, index) =>
         movie?.title &&
      <Link prefetch className='w-52 group mb-5 flex flex-col gap-3 justify-start items-center hover:scale-105 transition-all duration-300'
        key={`${movie?.title.toLowerCase().replaceAll(' ', '-')}-${index}`}
        href={`${URL_MOVIE_ID(movie?.id)}`}>
          <Image className='object-fill h-72 w-full' src={movie?.image ? movie?.image : imageDefault} width={200} height={150} alt='movie' />
          <div className='w-full text-center text-ellipsis whitespace-nowrap overflow-hidden'>{movie?.title}</div>
      </Link> ) : t('noMovie')}

      </div>

  )
}

export default MoviesFavorite
