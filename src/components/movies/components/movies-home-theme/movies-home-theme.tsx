'use client'
import React, { Suspense } from 'react'
import Title from '@/components/ui/components/title/title'
import 'react-multi-carousel/lib/styles.css';
import { IMovie } from '@/models/movie/movie';
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';
import { useLocale } from 'next-intl';
import MovieItemTheme from '../movie-item-theme/movie-item-theme';
import Container from '@/components/ui/components/container/container';
import Carousel from 'react-multi-carousel';
import MovieItemCarousel from '../movie-item-carousel/movie-item-carousel';

const MoviesHomeTheme = ({ movies, country, isMobileView }:{movies?:IMovie[], country?:string, isMobileView?:boolean}) => {

 const locale = useLocale()
 
 const responsive = {
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 3,
    slidesToSlide: 1 
  }
};

  return ( 
    <Suspense fallback={<LoadingSpinner />}>
      <div className={`w-full aspect-[1/0.4] relative bg-chicago bg-cover bg-center`}>
        <div className='absolute w-full h-full bg-slate-950 opacity-50  top-0 left-0 z-0'></div>
          <Container className='h-full pt-6 pb-6 flex relative flex-col justify-start items-start'>
            
            <Title className='text-2xl relative  md:text-4xl' text={country} type='h3' /> 

            <div className='h-full flex flex-wrap justify-start items-end gap-2'>
            {movies && movies?.length > 0 ?
            !isMobileView ?
              movies?.map((movie, index) => (
                <MovieItemTheme key={index} locale={locale} movie={movie} image={movie.image}  id={movie.id} />
              ))
            : 
            
            <Carousel
              containerClass="h-48 w-full mt-6 z-99"
              autoPlay={false}
              transitionDuration={500}
              draggable={true}
              infinite={true} 
              responsive={responsive} 
            >
              { movies && movies?.length > 0 && movies?.map((movie, index) => (
                  <MovieItemCarousel key={index} locale={locale} movie={movie} image={movie.image}  id={movie.id} />
                ))}
            </Carousel>
            : null}
            </div>
          </Container>
      </div>

    </Suspense>
  )
}

export default MoviesHomeTheme