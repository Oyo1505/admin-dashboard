'use client'
import { Button } from '@/components/ui/components/button/button';
import { IMovie } from '@/models/movie/movie'
import { useTranslations } from 'next-intl'
import React from 'react'
import { heuresEnMinutes } from 'utilities/number/minutesToHours'
import { addOrRemoveToFavorite } from '../../action';
import useUserStore from 'store/user/user-store';

interface MovieHeaderProps {
  movie?: IMovie;
  isFavorite: boolean;
}

const MovieHeader = ({movie, isFavorite}:MovieHeaderProps) => {
  const t = useTranslations('MoviePage')
  const {user} = useUserStore((state) => state)
  return (
    <div className='w-full lg:w-1/2'>
    <h1 className='text-3xl font-bold'>{movie?.title}</h1>
    <div>
      <span>{t('release')}: {movie?.year}</span>
      {movie?.genre && movie?.genre?.length > 0  ?  <span>-  Genre: </span> : undefined } 
      <span> - {t('country')}: {movie?.country}</span>
      {movie?.duration &&<span> - {t('duration')}: {heuresEnMinutes(movie?.duration)}</span> }
    </div>
      {movie?.tags &&<div>{movie?.tags?.map(tag => <span key={tag}>{tag}</span>)}</div> }
      <div className='mt-6 font-normal italic'> {t('synopsis')}: {movie?.synopsis}</div>
      <div className='mt-6 font-normal italic'> <form><Button formAction={() => user?.id && addOrRemoveToFavorite(user?.id ,movie?.id) }  >{ isFavorite ? t('removeFromFavorite') : t('addToFavorite')}</Button></form></div>
  </div>
  )
}

export default MovieHeader