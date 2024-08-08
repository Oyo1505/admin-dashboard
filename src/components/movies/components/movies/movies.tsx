'use client'
import React from 'react'
import Link from 'next/link'
import { URL_MOVIES } from '@/shared/route'
import Image from 'next/image';
import { IMovie } from '@/models/movie/movie';
import { useRouter } from 'next/navigation';
import imageDefault from '../../../../assets/image/default-placeholder.png'


const Movies = ({movies, offset, newOffset}:{movies?:IMovie[], offset?:number, newOffset?:number}) => {
 
  const router = useRouter();
  function onClick() {
    router.replace(`/movies/search?offset=${offset}`);
  }

  return (
    <div className='mt-7'>
      <div className='flex flex-row gap-4 items-start flex-wrap justify-start'>
      {movies && movies?.length > 0 ? movies?.map((movie, index) => 
      movie?.title &&
      <Link prefetch className='w-1/6 flex flex-col gap-3 justify-start items-center hover:scale-105 transition-all duration-300'
        key={`${movie?.title.toLowerCase().replaceAll(' ', '-')}-${index}`} 
        href={`${URL_MOVIES}/${movie?.id}`} >
          <Image className='object-fill' src={movie?.image ? movie?.image : imageDefault} width={200} height={150} alt='movie' />
          <div className='w-full text-center text-ellipsis whitespace-nowrap overflow-hidden'>{movie?.title}</div>
      </Link> ) : 'Pas de film disponible'}
      
      </div>
    </div>
  )
}

export default Movies