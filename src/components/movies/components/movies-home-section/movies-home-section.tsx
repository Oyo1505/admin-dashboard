'use client'
import React, { Suspense } from 'react'
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import MovieItemCarousel from '../movie-item-carousel/movie-item-carousel';
import { IMovie } from '@/models/movie/movie';
import { useLocale } from 'next-intl';

const MoviesHomeSection = ({ movies }:{movies?:IMovie[]}) => {
  const locale = useLocale()
  const responsive = {
    desktop: {
      breakpoint: {  max: 5000, min: 1024 },
      items: 5,
      slidesToSlide: 2
    },
    tablet: {
      breakpoint: { max: 1024, min: 465 },
      items: 5,
      slidesToSlide: 1 
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 5,
      slidesToSlide: 1 // optional, default to 1.
    }
  };
  return (
   
    <Suspense fallback={<div>Loading...</div>}>
       {movies && movies.length > 0 ?
      <Carousel
      ssr={true} 
      containerClass="h-30 w-full mt-6"
      autoPlay={false}
      transitionDuration={500}
      draggable={false}
      infinite={true} 
      responsive={responsive} 
      // customRightArrow={'>'}
      // customLeftArrow={'<'}
      >
        {movies.map((movie, index) => (
          <MovieItemCarousel key={index} title={locale === 'fr' ? movie?.title : movie?.originalTitle ?? movie?.title} image={movie.image} id={movie.id} />
        ))}
      </Carousel>
      : null}
    </Suspense>
  )
}

export default MoviesHomeSection