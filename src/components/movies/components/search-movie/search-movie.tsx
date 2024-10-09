'use client'
import { SearchIcon, Spinner } from '@/components/ui/components/icons/icons';
import { Input } from '@/components/ui/components/input/input';
import React, { useEffect, useRef, useTransition } from 'react'
import { useFiltersMovieStore, useMovieFormStore } from 'store/movie/movie-store';
import qs from 'qs';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { fetchMovies } from '../../action';

const SearchMovie = ( { search, offset }: { search: string, offset:number }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('Filters')
  const {filters, setFiltersData, hasBeenSearched, setHasBeenSearched} = useFiltersMovieStore();
  const { setMoviesStore } = useMovieFormStore();


  function onChangeSearch(e: any) {  
    setFiltersData({...filters, q: e.target.value});
  }


  const { data, isFetching, status, refetch } = useQuery({
    queryKey: ['moviesFilters', offset],
    enabled: false,
    queryFn:  () => fetchMovies({pageParam: offset, search: qs.stringify({ 
      subtitles: filters?.subtitles && filters?.subtitles?.length > 0 ? filters?.subtitles : undefined,
      language: filters?.language && filters?.language?.length > 0 ? filters?.language : undefined,
      genre: filters?.genre && filters?.genre?.length > 0 ? filters?.genre : undefined,
      q :  filters?.q && filters?.q?.length > 0 ? filters?.q : undefined,
    })}),
  });

  useEffect(() => {
    if(hasBeenSearched){
      refetch()
      setHasBeenSearched(false)
    }
  }, [hasBeenSearched, setHasBeenSearched, refetch]);
  
  useEffect(() => {
    if(data && data?.movies){
      setMoviesStore(data?.movies)
    }
  }, [data, setMoviesStore]);

  const onPressEnter = () => {
    setHasBeenSearched(true)
  }
  return (
    <div className="relative mt-6 w-4/6 m-auto">
      <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-background" />
      <Input
        ref={inputRef}
        value={filters?.q ?? undefined}
        onInput={(e) => onChangeSearch(e)}
        defaultValue={search ?? ''}
        spellCheck={false}
        className="w-full bg-white shadow-none text-background appearance-none pl-8"
        placeholder={t('placeholderSearch')}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onPressEnter()
          }
        }}
      />   
    </div>
  );
}

export default SearchMovie