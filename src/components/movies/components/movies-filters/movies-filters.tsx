'use client'
import React, { startTransition, use, useCallback, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { URL_MOVIES } from '@/shared/route'
import qs from 'qs';
import { useGetMoviesInfiniteScroll } from '../../hooks/use-get-all-image-infinite-scroll'
import ButtonSearch from '@/components/ui/components/button-search/button-search'
import { useFiltersMovieStore } from 'store/movie/movie-store'
import { languagesList } from '@/shared/constants/lang'

const MovieFilters = ({subtitles, language, genres, genre}:{subtitles?:string, language?:string, genres?:string[], genre?:string}) => {
  const locale = useLocale()
  const router = useRouter();
  const t = useTranslations('Filters')

  const { filters, setFiltersData, setHasBeenSearched } = useFiltersMovieStore();
  
  const { refetch } = useGetMoviesInfiniteScroll({pageParam: 5, search: qs.stringify({ 
    subtitles: filters?.subtitles && filters?.subtitles?.length > 0 ? filters?.subtitles : undefined,
    language: filters?.language && filters?.language?.length > 0 ? filters?.language : undefined,
    genre: filters?.genre && filters?.genre?.length > 0 ? filters?.genre : undefined,
    q :  filters?.q && filters?.q?.length > 0 ? filters?.q : undefined,
  })});


  function onChangeSubtitles(e: any) {
    const params = new URLSearchParams(window.location.search);
    if (e.target.value === undefined) {
      return;
    }
    else if (e.target.value) {
      params.set('subtitles', e.target.value);
    } else {
      params.delete('subtitles');
    }
    setFiltersData({...filters, subtitles: e.target.value});
  }
 
  function onChangeCountry(e: any) {
    const params = new URLSearchParams(window.location.search);
    if (e.target.value === undefined) {
      return;
    }
    else if (e.target.value) {
      params.set('language', e.target.value);
    } else {
      params.delete('language');
    }
    setFiltersData({...filters, language: e.target.value});
  }

  function onChangeGenre(e: any) {
    const params = new URLSearchParams(window.location.search);
    if (e.target.value === undefined) {
      return;
    }
    else if (e.target.value) {
      params.set('genre', e.target.value);
    } else {
      params.delete('genre');
    }
    setFiltersData({...filters, genre: e.target.value});
  }

  useEffect(() => {
    startTransition(() => {
      router.replace(`${URL_MOVIES}?${qs.stringify({ 
        q:  filters?.q && filters?.q?.length > 0 ? filters?.q : undefined,
        subtitles: filters?.subtitles && filters?.subtitles?.length > 0 ? filters?.subtitles : undefined,
        language: filters?.language &&  filters?.language?.length > 0 ? filters?.language : undefined,  
        genre: filters?.genre && filters?.genre?.length > 0 ? filters?.genre : undefined,
      })}`);
    });
    
  }, [filters, router]);

  const onClick = () => {
    refetch() 
    setHasBeenSearched(true)
  };

  return (
    <div className="flex flex-col md:flex-row gap-5 md:gap-2 relative mt-6 w-4/6 m-auto place-items-end justify-between">
      <div className="flex w-full flex-col md:flex-row  gap-2">
        <fieldset className="flex flex-col gap-2 md:w-64">
          <label>{t('subtitles')}</label>
          <select onChange={onChangeSubtitles} defaultValue={subtitles ?? filters?.subtitles} className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'>
            <option> </option>
            <option value="EN">{t('subtitlesEN')}</option>
            <option value="JP">{t('subtitlesJP')}</option>
            <option value="FR">{t('subtitlesFR')}</option>
          </select>
        </fieldset>
        <fieldset  className="flex flex-col gap-2 md:w-64">
          <label>{t('language')}</label>
          <select   onChange={onChangeCountry} defaultValue={language ?? filters?.language} className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'>
            <option> </option>
          {languagesList.map((country, index) => (
              <option  key={`${
              //@ts-ignore
              country?.label?.[locale]}-${index}`} value={country?.value}>
                {//@ts-ignore
                country?.label?.[locale]}
              </option>
            ))}
          </select>
        </fieldset>
        <fieldset  className="flex flex-col gap-2 md:w-64">
          <label>Genre</label>
          <select   onChange={onChangeGenre} defaultValue={genre ?? filters?.genre} className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'>
            <option> </option>
            {genres?.map((genre, index) => (
              <option  key={`${genre}-${index}`} value={genre}>
                {genre}
              </option>
            ))}
        
          </select>
        </fieldset>
    </div>
      <ButtonSearch className='w-full md:w-auto' btnText={t('btnSearch')} onClick={onClick} />
    </div>
  )
}

export default MovieFilters