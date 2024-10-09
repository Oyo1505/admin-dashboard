'use client'
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import qs from 'qs';
import { URL_MOVIES } from '@/shared/route'
import Image from 'next/image';
import imageDefault from '../../../../assets/image/default-placeholder.png'
import { useGetMoviesInfiniteScroll } from '../../hooks/use-get-all-image-infinite-scroll';
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';
import { titleOnlocale } from 'utilities/string/titleOnlocale';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/components/button/button';
import { useFiltersMovieStore, useMovieFormStore } from 'store/movie/movie-store';

const Movies = ({searchParams, offset}:{searchParams?:any, offset?:number}) => {
  const { filters } = useFiltersMovieStore();
  const { moviesFromStore, setMoviesStore } = useMovieFormStore();
  const locale = useLocale();
  const { data, isFetching, status, hasNextPage, fetchNextPage, isFetchingNextPage } = useGetMoviesInfiniteScroll({pageParam: offset, search: Object.keys(searchParams).length > 0 ? qs.stringify({ 
    subtitles: filters?.subtitles && filters?.subtitles?.length > 0 ? filters?.subtitles : undefined,
    language: filters?.language && filters?.language?.length > 0 ? filters?.language : undefined,
    genre: filters?.genre && filters?.genre?.length > 0 ? filters?.genre : undefined,
    q :  filters?.q && filters?.q?.length > 0 ? filters?.q : undefined,
  }) : ''});
 

  const t = useTranslations('MoviesPage')

  const filteredMovies = useMemo(() => {
    if (status === "success") {
      if (Object.keys(searchParams).length > 0) {
        return data?.pages[data.pages.length - 1]?.movies || [];
      } else if (Object.keys(searchParams).length === 0){
 
       return data?.pages[0]?.movies || [];
      }
    }
  
    return [];
  }, [data, searchParams, status]);
   
  useEffect(() => {
    if(filteredMovies?.length > 0){
      setMoviesStore(filteredMovies);
    }
  }, [filteredMovies, setMoviesStore]);

  const fecthNextMovie = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage().then((res) => {
        if(res?.data?.pages){
        setMoviesStore(res?.data.pages[res?.data?.pages?.length-1]?.movies ?? []) 
        }else{
          setMoviesStore([])
        }
      }).catch(err => console.error(err));
    }
  };

  if (status === 'pending' && isFetching) return <LoadingSpinner className='flex justify-center h-screen' />

  return (
    <>
  <div className='flex flex-row gap-4 mt-6 items-start flex-wrap justify-center lg:justify-start'>
    {moviesFromStore && moviesFromStore.length > 0 ? moviesFromStore.map((movie, index) => 
      movie?.title && (
        <Link prefetch className='w-52 group mb-5 flex h-full flex-col gap-3 justify-start items-center transition-all duration-300'
          key={`${movie?.title.toLowerCase().replaceAll(' ', '-')}-${index}`} 
          href={`${URL_MOVIES}/${movie?.id}`}>
          
          <div className='flex relative w-full rounded-lg flex-col justify-between h-full'>
            <div className='w-full h-72 rounded-lg relative overflow-hidden'>
              <Image
                priority
                className='w-full h-full rounded-lg transform transition-transform duration-300 group-hover:scale-110'
                src={movie?.image ? movie?.image : imageDefault}
                width={300}
                height={200}
                alt='movie'
              />
            </div>
          </div>
          <div className='w-full text-center text-ellipsis whitespace-nowrap overflow-hidden'>
            {titleOnlocale(movie, locale)}
          </div>
        </Link>
      )) : <div className='w-full text-center mt-14 text-2xl'> {t('NoMovie')} </div>}
  
  </div>
  <div className='flex justify-center mt-10'>
  {isFetching || isFetchingNextPage && status !== 'success' ? 
    <LoadingSpinner /> : 
  !hasNextPage  || (moviesFromStore && moviesFromStore.length === 0) ? null : 
    <Button variant={'outline'} onClick={() => fecthNextMovie()} className='min-w-80 flex align'>Load more</Button>}
  </div>
  </>
  )
}

export default Movies