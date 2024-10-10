'use client'
import { Button } from '@/components/ui/components/button/button';
import { IMovie } from '@/models/movie/movie'
import { useLocale, useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { heuresEnMinutes } from 'utilities/number/minutesToHours'
import { addOrRemoveToFavorite } from '../../action';
import useUserStore from 'store/user/user-store';
import countriesList from '@/shared/constants/countries';
import { languagesList } from '@/shared/constants/lang';
import { titleOnlocale } from 'utilities/string/titleOnlocale';
import { DoawloadLogo, Favorite } from '@/components/ui/components/icons/icons';
import { toast } from 'react-toastify';
import useGetDetailsMovie from '../../hooks/useGetDetailsMovie';
interface MovieHeaderProps {
  movie?: IMovie;
  isFavorite: boolean;
}

const MovieHeader = ({movie, isFavorite}:MovieHeaderProps) => {
  const t = useTranslations('MoviePage')
  const locale = useLocale()
  const [isLoading, setIsLoading] = useState(false);
  const { data: movieDetails } = useGetDetailsMovie({id:movie?.imdbId ?? '', language:locale})
  const synopsis = movieDetails?.movie_results[0]?.overview
  
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
  const handleFavorite =  () => {
    if (user?.id) {
      setIsLoading(true); 
     
      try {
         addOrRemoveToFavorite(user?.id, movie?.id);
        toast.success(t('toastMessageSuccess'), { position: "top-center" });
      } catch (err) {
        toast.error(t('toastMessageError'), { position: "top-center" });
      } finally {
        setIsLoading(false); 
      }
    }
  };
  const titleCompute = (title: string | undefined | null) => {
    return title?.replaceAll(' ', '+')?.toLocaleLowerCase()
  }
  
  return (
    <div className='w-full lg:w-1/2 mt-4 md:mt-0'>
    <div className='mb-4'>
    <h1 className='text-3xl font-bold'>{movie && titleOnlocale(movie, locale)}</h1>
      {movie?.originalTitle && <div className='mt-2 mb-2  font-normal italic'> {t('originalTitle')}: {movie?.originalTitle}</div>}
      {movie?.director && <div className='mt-2 mb-2  font-bold'> {t('director')}: {movie?.director}</div>}
    </div>
    <div className='mb-4 flex flex-col gap-2'>
      {movie?.year && <div className='inline'>{t('release')}: {movie?.year}</div>}
      {movie?.genre && movie?.genre?.length > 0  &&  <div className='inline'>{t('genre')}:  {movie?.genre?.map(item => <span className='mr-1' key={item}>{item}</span>)}</div>} 
      {movie?.country && <div className='inline'>{t('country')}: { 
        //@ts-ignore
      findCountry?.[0]?.label?.[locale]}</div>}
      {movie?.duration && movie?.duration > 0 &&<span>{t('duration')}: {heuresEnMinutes(movie?.duration)}</span> }
      {movie?.language &&<span>{t('langage')}: {
        //@ts-ignore
      language?.[0]?.label?.[locale]}</span> }
    </div>
      
      {movie?.tags &&<div>{movie?.tags?.map(tag => <span key={tag}>{tag}</span>)}</div> }
      {movie?.subtitles && movie?.subtitles?.length > 0  &&<div className='flex flex-wrap gap-2'>{t('subtitles')}: {movie?.subtitles?.map(item => <span key={item}>{
      //@ts-ignore
      displaySubtitles(item)}</span>)}</div> }
      {synopsis ? <div className='mt-6 font-normal'> {t('synopsis')} : { synopsis }</div> : movie?.synopsis && <div className='mt-6 font-normal'> {t('synopsis')} : {movie?.synopsis}</div>}
      <div className='mt-10 font-normal flex flex-col gap-3'> 
        <form>
          <Button
            disabled={isLoading}
            className='flex justify-start items-center gap-2' 
            formAction={handleFavorite}
          >
          {isFavorite ?
          <>
            <Favorite fill={true} />
            {t('removeFromFavorite')}
          </>
           :    
          <>
            <Favorite /> 
            {t('addToFavorite')}
          </>
          }
          </Button>
        </form>
        <div>
          <a 
          href={`https://drive.usercontent.google.com/download?id=${movie?.idGoogleDive}&export=download`} 
          className='inline-flex gap-2 rounded-md p-3 h-10 min-w-16 px-4 py-2 bg-primary text-background  font-bold hover:bg-primary hover:text-blue-400' 
          target='_blank' download>
            {
              <DoawloadLogo />
            }
          {t('download')}
            </a>
          <div className='flex flex-col gap-2 mt-4'>
              <h4 className='font-bold'>{t('titleWebSubtitles')}</h4>
              <ul>
                <li>
                  <a href={`https://www.opensubtitles.org/${locale === 'fr' ? 'fr' : 'en'}/search/sublanguageid-all/moviename-${titleCompute(movie?.title)}`} 
                    target='_blank' rel='noreferrer'>
                     - OpenSubtitles
                  </a>
                </li>
                {movie?.imdbId && <li><a href={`https://yifysubtitles.ch/movie-imdb/${movie?.imdbId}`} target='_blank' rel='noreferrer'>- Yifi Subtitles</a></li>}
                <li><a href={`https://www.subtitlecat.com/index.php?search=${movie?.titleEnglish?.replaceAll(' ', '+')?.toLocaleLowerCase()}`} target='_blank' rel='noreferrer'>- SubtitleCat</a></li>
              </ul>
          </div>
        </div>
      </div>
  </div>
  )
}

export default MovieHeader