'use client'
import React, { startTransition, useEffect, useLayoutEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { URL_MOVIES } from '@/shared/route'
import qs from 'qs';
import ButtonSearch from '@/components/ui/components/button-search/button-search'
import { useFiltersMovieStore, useMovieFormStore } from 'store/movie/movie-store'
import { decade } from '@/shared/constants/decade'
import { useQuery } from '@tanstack/react-query'
import { fetchMovies } from '../../action'
import countriesList from '@/shared/constants/countries'
import { IGenre } from '@/models/movie/movie'
import displayGenreTranslated from '@/shared/utils/string/displayGenreTranslated'
import LabelForm from '@/components/ui/components/label-form/label-form'

const MovieFilters = ({subtitles,q, language, genres, genre, offset, countries, decadeParams}:{subtitles?:string, language?:string, genres?:IGenre[], genre?:string, offset:number, countries?:string[] | undefined, decadeParams?:number, q?:string}) => {
  const locale = useLocale()
  const router = useRouter();
  const t = useTranslations('Filters');
  const [isMounted, setIsMounted] = useState(false);
  const { setMoviesStore } = useMovieFormStore();
  const { filters, setFiltersData, setHasBeenSearched, hasBeenSearched } = useFiltersMovieStore();
  const listCountries = countriesList.filter(country => countries?.includes(country.value));

  const { data, status, refetch } = useQuery({
    queryKey: ['moviesFilters', offset],
    enabled: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn:  () => fetchMovies({pageParam: offset, search: qs.stringify({ 
      subtitles: filters?.subtitles && filters?.subtitles?.length > 0 ? filters?.subtitles : undefined,
      language: filters?.language && filters?.language?.length > 0 ? filters?.language : undefined,
      decade: filters?.decade && filters?.decade > 0 ? filters?.decade : undefined,
      genre: filters?.genre && filters?.genre?.length > 0 ? filters?.genre : undefined,
      q :  filters?.q && filters?.q?.length > 0 ? filters?.q : undefined,
    })}),
  });

  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);


  useEffect(() => {
    if(isMounted && (genre !== '' || language !== ''  || subtitles !== '' || q !== '' ||  decadeParams && decadeParams > 0)){
      setFiltersData({...filters, genre, language, subtitles, decade: decadeParams, q})
      setIsMounted(false)
      refetch()
    }
  }, [filters, setFiltersData, isMounted, genre, language, refetch, status, subtitles, decadeParams, q])


  function onChangeSubtitles(e: React.ChangeEvent<HTMLSelectElement>) {
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
 
  function onChangeCountry(e: React.ChangeEvent<HTMLSelectElement>) {
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

  function onChangeDecade(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(window.location.search);
    if (e.target.value === undefined) {
      return;
    }
    const decadeValue = e.target.value ? Number(e.target.value) : undefined;
    if (e.target.value) {
      params.set('decade', e.target.value);
    } else {
      params.delete('decade');
    }
    setFiltersData({...filters, decade: decadeValue});
  }

  function onChangeGenre(e: React.ChangeEvent<HTMLSelectElement>) {
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
    if(hasBeenSearched){
      refetch()
      setHasBeenSearched(false)
    }
  }, [hasBeenSearched, setHasBeenSearched, refetch]);

  useEffect(() => {
    if(data && data?.movies && status === 'success'){
      setMoviesStore(data?.movies)
    }
  }, [data, setMoviesStore, status]);

  const onClick = () => {
    startTransition(() => {
      router.replace(`${URL_MOVIES}?${qs.stringify({ 
        q:  filters?.q && filters?.q?.length > 0 ? filters?.q : undefined,
        subtitles: filters?.subtitles && filters?.subtitles?.length > 0 ? filters?.subtitles : undefined,
        language: filters?.language &&  filters?.language?.length > 0 ? filters?.language : undefined,  
        decade: filters?.decade &&  filters?.decade > 0 ? filters?.decade : undefined,  
        genre: filters?.genre && filters?.genre?.length > 0 ? filters?.genre : undefined,
      })}`);
    });
    setHasBeenSearched(true)
  };

  return (
    <div className="flex flex-col gap-9 md:gap-2 relative mt-6 w-4/6 m-auto place-items-start justify-between">
      <div className="flex w-full flex-col md:flex-row flex-nowrap gap-2">
        <div className="flex flex-col gap-2 md:w-64">
        <LabelForm titleLabel={t('subtitles')} className='text-white' htmlFor='subtitles' />
          <select onChange={onChangeSubtitles} defaultValue={subtitles ?? filters?.subtitles} className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'>
            <option> </option>
            <option value="EN">{t('subtitlesEN')}</option>
            <option value="JP">{t('subtitlesJP')}</option>
            <option value="FR">{t('subtitlesFR')}</option>
          </select>
        </div>
        <div  className="flex flex-col gap-2 md:w-64">
        <LabelForm titleLabel={t('language')} className='text-white' htmlFor='language' />
          <select   
            onChange={onChangeCountry} 
            defaultValue={language ?? filters?.language} 
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'>
          <option> </option>
          {listCountries.map((country, index) => (
              <option  key={`${
              //@ts-ignore
              country?.label?.[locale]}-${index}`} value={country?.value}>
                {//@ts-ignore
                country?.label?.[locale]}
              </option>
            ))}
          </select>
        </div>
        <div  className="flex flex-col gap-2 md:w-64">
          <LabelForm titleLabel={t('decade')}className='text-white' htmlFor='decade' />
          <select   
            onChange={onChangeDecade} 
            defaultValue={String(decadeParams ?? filters?.decade)}  
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'>
          <option> </option>
          {decade?.decade.map((dec, index) => (
              <option  key={`${dec}-${index}`} value={dec}>
                {dec}
              </option>
            ))}
          </select>
        </div>
        <div  className="flex flex-col gap-2 md:w-64">
          <LabelForm titleLabel={t('genre')} className='text-white' htmlFor='genre' />
          <select   onChange={onChangeGenre} defaultValue={genre ?? filters?.genre} className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'>
            <option> </option>
            {genres?.map((genre, index) => (
              <option  key={`${genre.id}-${index}`} value={displayGenreTranslated(genre, locale)}>
                {displayGenreTranslated(genre, locale)}
              </option>
            ))}
        
          </select>
        </div>
    </div>
      <ButtonSearch className='w-full md:w-full lg:max-w-56 transition-all duration-300' btnText={t('btnSearch')} onClick={onClick} />
    </div>
  )
}

export default MovieFilters