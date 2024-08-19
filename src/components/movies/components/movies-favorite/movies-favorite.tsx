'use client'
import React from 'react'
import Link from 'next/link'
import { URL_MOVIES } from '@/shared/route'
import Image from 'next/image';
import { IMovie } from '@/models/movie/movie';
import imageDefault from '../../../../assets/image/default-placeholder.png'
import { useTranslations } from 'next-intl';


const MoviesFavorite = ({movies, offset, newOffset}:{movies?:IMovie[], offset?:number, newOffset?:number}) => {
  const t = useTranslations('Dashboard')
  return (
      <div className='flex flex-row gap-4 mt-6 items-start flex-wrap justify-start'>
      {movies && movies?.length > 0 ? movies?.map((movie, index) => 
         movie?.title &&
      <Link prefetch className='w-52 group mb-5 flex flex-col gap-3 justify-start items-center hover:scale-105 transition-all duration-300'
        key={`${movie?.title.toLowerCase().replaceAll(' ', '-')}-${index}`} 
        href={`${URL_MOVIES}/${movie?.id}`} >
          <Image className='object-fill h-72 w-full' src={movie?.image ? movie?.image : imageDefault} width={200} height={150} alt='movie' />
          <div className='w-full text-center text-ellipsis whitespace-nowrap overflow-hidden'>{movie?.title}</div>
      </Link> ) : t('NoMovie')}
      
      </div>
  
  ) 
}

export default MoviesFavorite