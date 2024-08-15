'use client'
import React, { startTransition, use, useCallback, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { URL_MOVIES } from '@/shared/route'
import qs from 'qs';
import { useGetMoviesInfiniteScroll } from '../../hooks/use-get-all-image-infinite-scroll'
import ButtonSearch from '@/components/ui/components/button-search/button-search'
import { useFiltersMovieStore } from 'store/movie/movie-store'
import { languagesList } from '@/shared/constants/lang'

const MovieFilters = ({subtitles, language}:{subtitles?:string, language?:string}) => {
  const locale = useLocale()
  const router = useRouter();

 const { filters, setFiltersData, setHasBeenSearched } = useFiltersMovieStore();
   const { handleSearchChange } = useGetMoviesInfiniteScroll({pageParam: 5, search: qs.stringify({ 
    subtitles: filters?.subtitles && filters?.subtitles?.length > 0 ? filters?.subtitles : undefined,
    language: filters?.language && filters?.language?.length > 0 ? filters?.language : undefined,
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

  const routeReplace = useCallback(() => {
    startTransition(() => {
      router.replace(`${URL_MOVIES}?${qs.stringify({ 
        q:  filters?.q && filters?.q?.length > 0 ? filters?.q : undefined,
        subtitles: filters?.subtitles && filters?.subtitles?.length > 0 ? filters?.subtitles : undefined,
        language: filters?.language &&  filters?.language?.length > 0 ? filters?.language : undefined,  
      })}`);
    });
 
  }, [filters, router]);

  const onClick = () => {
    startTransition(() => {
      // All navigations are transitions automatically
      // But wrapping this allow us to observe the pending state
      routeReplace()
    });
    handleSearchChange() 
    setHasBeenSearched(true)
  };
  
  return (
    <div className="flex flex-row gap-2 relative mt-6 w-4/6 m-auto">
     <fieldset className="flex flex-col gap-2">
      <label>Subtitles</label>
      <select onChange={onChangeSubtitles} defaultValue={subtitles ?? filters?.subtitles} className='text-background'>
        <option> </option>
        <option value="EN">English</option>
        <option value="JP">Japanese</option>
        <option value="FR">French</option>
      </select>
    </fieldset>
    <fieldset className="flex flex-col gap-2">
      <label>Langage</label>
      <select  onChange={onChangeCountry} defaultValue={language ?? filters?.language} className='text-background'>
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
    <ButtonSearch onClick={onClick} />
    </div>
  )
}

export default MovieFilters