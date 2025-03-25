'use client'
import React, { useEffect, useMemo } from 'react'
import Link from 'next/link'
import qs from 'qs';
import { URL_MOVIE_ID } from '@/shared/route'
import Image from 'next/image';
import { useGetMoviesInfiniteScroll } from '../../hooks/use-get-all-image-infinite-scroll';
import LoadingSpinner from '@/domains/shared/loading-spinner/loading-spinner';
import { titleOnlocale } from 'utilities/string/titleOnlocale';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/domains/ui/components/button/button';
import { useFiltersMovieStore, useMovieFormStore } from 'store/movie/movie-store';
import imageDefault from '../../../../assets/image/default-placeholder.png';

interface SearchParams {
  subtitles?: string;
  language?: string;
  decade?: string;
  genre?: string;
  q?: string;
}

const Movies = ({searchParams, offset}:{searchParams?:SearchParams | undefined, offset?:number}) => {
  const { filters } = useFiltersMovieStore();
  const { moviesFromStore, setMoviesStore } = useMovieFormStore();
  const locale = useLocale();
  const { data, isFetching, status, hasNextPage, fetchNextPage, isFetchingNextPage } = useGetMoviesInfiniteScroll({pageParam: offset, search: searchParams && Object.keys(searchParams).length > 0 ? qs.stringify({ 
    subtitles: filters?.subtitles && filters?.subtitles?.length > 0 ? filters?.subtitles :  searchParams.subtitles  ? searchParams.subtitles : undefined,
    language: filters?.language && filters?.language?.length > 0 ? filters?.language :  searchParams.language ? searchParams.language : undefined,
    decade: filters?.decade && filters?.decade > 0  ? filters?.decade :   Number(searchParams.decade) > 0 ? Number(searchParams.decade) : undefined,
    genre: filters?.genre && filters?.genre?.length > 0 ? filters?.genre : searchParams.genre ? searchParams.genre : undefined,
    q :  filters?.q && filters?.q?.length > 0 ? filters?.q : searchParams.q ? searchParams.q : undefined,
  }) : ''});

  const t = useTranslations('MoviesPage')

  const filteredMovies = useMemo(() => {
    if (status === "success") {
      if (searchParams && Object.keys(searchParams).length > 0) {
        return data?.pages[data.pages.length - 1]?.movies || [];
      } else if (searchParams && Object.keys(searchParams)?.length === 0){
 
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
  <div className='grid grid-cols-1 mx-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6'>
    {moviesFromStore && moviesFromStore.length > 0 ? moviesFromStore.map((movie, index) => 
      movie?.title && (
        <Link prefetch className='w-52 group flex h-full flex-col gap-3 justify-start items-center transition-all duration-300 pb-5'
          key={`${movie?.title.toLowerCase().replaceAll(' ', '-')}-${index}`} 
          href={`${URL_MOVIE_ID(movie?.id)}`}>
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
  !hasNextPage  || (moviesFromStore && moviesFromStore.length < 12) ? null : 
    <Button variant={'outline'} onClick={() => fecthNextMovie()} className='min-w-80 flex align'>{t('btnLoadMore')}</Button>}
  </div>
  </>
  )
}

export default Movies