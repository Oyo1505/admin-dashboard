'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { URL_MOVIES } from '@/shared/route'
import Image from 'next/image';
import { IMovie } from '@/models/movie/movie';
import { usePathname, useRouter } from 'next/navigation';
import imageDefault from '../../../../assets/image/default-placeholder.png'
import { useGetMoviesInfiniteScroll } from '../../hooks/use-get-all-image-infinite-scroll';
import {  useInView } from 'react-intersection-observer'
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';

const Movies = ({searchParams, offset}:{searchParams?:any, offset?:number}) => {
 const { ref, inView, entry } = useInView();
  const [images, setImages] = useState<IMovie[]>();
  const pathname = usePathname();
  // function onClick() {
  //   router.replace(`/movies/?offset=${offset}`);
  // }

  const { data, isFetching, status, hasNextPage, fetchNextPage, isFetchingNextPage,} = useGetMoviesInfiniteScroll({pageParam: 5});
  
  useEffect(() => {
    if(status === "success" && data?.pages.length === 1){
      setImages(data?.pages[0]?.movies)
    }
  }, [setImages, data, status, hasNextPage, pathname])

  
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage  && status === "success" ) { 
      fetchNextPage()
      setImages(data?.pages[data?.pages?.length-1]?.movies)
    }
  }, [inView,fetchNextPage, hasNextPage, data, status, isFetchingNextPage, entry ])

  if (status === 'pending' && isFetching) return <LoadingSpinner />

  return (
    
  <div className='flex flex-row gap-4 mt-6 items-start flex-wrap justify-center lg:justify-start'>
    {images && images.length > 0 ? images.map((movie, index) => 
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
            {movie?.title}
          </div>
        </Link>
      )) : 'Pas de film disponible'}
    {isFetching ? <LoadingSpinner /> :  <div ref={ref} style={{ height: '1px', width: '100%', backgroundColor: 'transparent' }} />}
  
  </div>
  )
}

export default Movies