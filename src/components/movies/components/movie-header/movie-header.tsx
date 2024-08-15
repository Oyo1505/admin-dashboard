'use client'
import { Button } from '@/components/ui/components/button/button';
import { IMovie } from '@/models/movie/movie'
import { useLocale, useTranslations } from 'next-intl'
import React from 'react'
import { heuresEnMinutes } from 'utilities/number/minutesToHours'
import { addOrRemoveToFavorite } from '../../action';
import useUserStore from 'store/user/user-store';
import countriesList from '@/shared/constants/countries';
import { languagesList } from '@/shared/constants/lang';

interface MovieHeaderProps {
  movie?: IMovie;
  isFavorite: boolean;
}

const MovieHeader = ({movie, isFavorite}:MovieHeaderProps) => {
  const t = useTranslations('MoviePage')
  const locale = useLocale()

  const displaySubtitles = (value: string) => {
    switch (value) { 
      case  'FR':
        return t('subtitlesFR')
      case 'JP':
        return t('subtitlesJP')
      case 'EN':
        return t('subtitlesEN')
      default:
        return null
    }
  }
  
  const {user} = useUserStore((state) => state)
  const findCountry = countriesList?.filter((item) => item?.value === movie?.country)
  const language = languagesList?.filter((item) => item?.value === movie?.language)
  console.log(language)
  return (
    <div className='w-full lg:w-1/2 mt-4 md:mt-0'>
    <div className='mb-4'>
    <h1 className='text-3xl font-bold'>{locale === 'fr' && movie?.title?  movie?.title : movie?.originalTitle ?? movie?.title}</h1>
    {movie?.originalTitle && <div className='mt-2 mb-2 font-normal italic'> {t('originalTitle')}: {movie?.originalTitle}</div>}
    </div>
    <div className='mb-4'>
      {movie?.year && <div className='inline'>{t('release')}: {movie?.year}</div>}
      {movie?.genre && movie?.genre?.length > 0  &&  <div className='inline'> -  {t('genre')}:  {movie?.genre?.map(item => <span className='mr-1' key={item}>{item}</span>)}</div>} 
      {movie?.country && <div className='inline'>- {t('country')}: { 
        //@ts-ignore
      findCountry?.[0]?.label?.[locale]}</div>}
      {movie?.duration && movie?.duration > 0 &&<span> - {t('duration')}: {heuresEnMinutes(movie?.duration)}</span> }
      {movie?.language &&<span> - {t('langage')}: {
        //@ts-ignore
      language?.[0]?.label?.[locale]}</span> }
    </div>
      
      {movie?.tags &&<div>{movie?.tags?.map(tag => <span key={tag}>{tag}</span>)}</div> }
      {movie?.subtitles && movie?.subtitles?.length > 0  &&<div className='flex flex-wrap gap-2'>{t('subtitles')}: {movie?.subtitles?.map(item => <span key={item}>{
      //@ts-ignore
      displaySubtitles(item)}</span>)}</div> }
      {movie?.synopsis && <div className='mt-6 font-normal'> {t('synopsis')} : {movie?.synopsis}</div>}
      <div className='mt-10 font-normal italic'> <form><Button formAction={() => user?.id && addOrRemoveToFavorite(user?.id ,movie?.id) }  >{ isFavorite ? t('removeFromFavorite') : t('addToFavorite')}</Button></form></div>
  </div>
  )
}

export default MovieHeader