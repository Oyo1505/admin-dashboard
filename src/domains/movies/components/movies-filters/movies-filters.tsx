'use client'
import React, { startTransition, useEffect, useLayoutEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { URL_MOVIES } from '@/shared/route'
import qs from 'qs';
import ButtonSearch from '@/domains/ui/components/button-search/button-search'
import { useFiltersMovieStore, useMovieFormStore } from 'store/movie/movie-store'
import { decade } from '@/shared/constants/decade'
import { useQuery } from '@tanstack/react-query'
import { fetchMovies } from '../../action'
import { IGenre } from '@/models/movie/movie'
import displayGenreTranslated from '@/shared/utils/string/displayGenreTranslated'
import LabelForm from '@/domains/ui/components/label-form/label-form'
import { Locale } from '@/models/lang/lang'
import countriesList from '@/shared/constants/countries';

type SelectSubtitlesProps = {
  subtitles?: string;
  // eslint-disable-next-line no-unused-vars
  onChangeSubtitles: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  filters?: { subtitles?: string };
};

const SelectSubtitles = ({subtitles, onChangeSubtitles, filters}:SelectSubtitlesProps) => {
  const t = useTranslations('Filters');

  const subtitlesList = {
    EN: t('subtitlesEN'),
    JP: t('subtitlesJP'),
    FR: t('subtitlesFR')
  }
  return (
    <div className="flex flex-col gap-2 md:w-64">
    <LabelForm titleLabel={t('subtitles')} className='text-white' htmlFor='subtitles' />
      <select onChange={onChangeSubtitles} defaultValue={subtitles ?? filters?.subtitles} className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5'>
        <option> </option>
        {Object.entries(subtitlesList).map(([key, value], index) => (
          <option key={`${key}-${index}`} value={key}>
            {value}
          </option>
        ))}
      </select>
    </div>
  )
}

type SelectLanguageProps = {
  language?: string;
  // eslint-disable-next-line no-unused-vars
  onChangeLanguage: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  filters?: { language?: string };
  listLanguages: any;
};

const SelectLanguage = ({language, onChangeLanguage, filters, listLanguages}:SelectLanguageProps) => {
  const t = useTranslations('Filters');
  const locale = useLocale() as Locale

  return (
    <div  className="flex flex-col gap-2 md:w-64">
    <LabelForm titleLabel={t('language')} className='text-white' htmlFor='language' />
      <select   
        onChange={onChangeLanguage} 
        defaultValue={language ?? filters?.language} 
        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 '>
      <option> </option>
      {listLanguages.map((language: any, index: number) => (
          <option  key={`${language?.label?.[locale]}-${index}`} value={language?.value}>
            {language?.label?.[locale]}
          </option>
        ))}
      </select>
    </div>
  )
}

type SelectGenreProps = {
  genre?: string;
  // eslint-disable-next-line no-unused-vars
  onChangeGenre: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  filters?: { genre?: string };
  genres: any;
};

const SelectGenre = ({genre, onChangeGenre, filters, genres}:SelectGenreProps) => {
  const t = useTranslations('Filters');
  const locale = useLocale() as Locale
  return (
      <div  className="flex flex-col gap-2 md:w-64">
      <LabelForm titleLabel={t('genre')} className='text-white' htmlFor='genre' />
      <select  onChange={onChangeGenre} defaultValue={genre ?? filters?.genre} className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5'>
        <option> </option>
        {genres?.map((genre: any, index: number) => (
          <option  key={`${genre.id}-${index}`} value={displayGenreTranslated(genre, locale)}>
            {displayGenreTranslated(genre, locale)}
          </option>
        ))}
    
      </select>
    </div>
  )
}

type SelectDecadeProps = {
  decade?: number[];
  // eslint-disable-next-line no-unused-vars
  onChangeDecade: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  defaultValue?: string;
  filters?: { decade?: string };
};

const SelectDecade = ({decade, onChangeDecade, defaultValue, filters}:SelectDecadeProps) => {
  const t = useTranslations('Filters');
  return (
    <div  className="flex flex-col gap-2 md:w-64">
    <LabelForm titleLabel={t('decade')}className='text-white' htmlFor='decade' />
    <select   
      onChange={onChangeDecade} 
      defaultValue={defaultValue ?? filters?.decade}  
      className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5'>
    <option> </option>
    {decade?.map((dec: number, index: number) => (
        <option  key={`${dec}-${index}`} value={dec}>
          {dec}
        </option>
      ))}
    </select>
  </div>
  )
}

const MovieFilters = ({subtitles, q, language, genres, genre, offset, decadeParams, countries}:{subtitles?:string, language?:string, genres?:IGenre[], genre?:string, offset:number, decadeParams?:number, q?:string, countries:string[]}) => {
  const router = useRouter();
  const t = useTranslations('Filters');
  const [isMounted, setIsMounted] = useState(false);
  const { setMoviesStore } = useMovieFormStore();
  const { filters, setFiltersData, setHasBeenSearched, hasBeenSearched } = useFiltersMovieStore();

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
  const listCountries = countriesList.filter(country => countries?.includes(country.value));
  return (
    <div className="flex flex-col gap-9 md:gap-2 relative mt-6 w-4/6 m-auto place-items-start justify-between">
      <div className="flex w-full flex-col md:flex-row flex-nowrap gap-2">
        <SelectSubtitles subtitles={subtitles} onChangeSubtitles={onChangeSubtitles} filters={filters} />
        <SelectLanguage language={language} onChangeLanguage={onChangeCountry} listLanguages={listCountries} filters={filters} />
        <SelectDecade decade={decade?.decade} defaultValue={String(decadeParams ?? filters?.decade)} onChangeDecade={onChangeDecade} filters={{ decade: filters?.decade?.toString() }} />
        <SelectGenre genre={genre} onChangeGenre={onChangeGenre} filters={filters} genres={genres} />
      </div>
      <ButtonSearch className='w-full hover:cursor-pointer md:w-full lg:max-w-56 transition-all duration-300' btnText={t('btnSearch')} onClick={onClick} />
    </div>
  )
}

export default MovieFilters