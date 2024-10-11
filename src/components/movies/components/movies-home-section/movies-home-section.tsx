'use client'
import React, { Suspense } from 'react'
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import MovieItemCarousel from '../movie-item-carousel/movie-item-carousel';
import { IMovie } from '@/models/movie/movie';
import { useLocale } from 'next-intl';

const MoviesHomeSection = ({ movies, isMobileView }:{movies?:IMovie[], isMobileView?:boolean}) => {
  const locale = useLocale()
  const responsive = {
    desktop: {
      breakpoint: {  max: 5000, min: 1025 },
      items: 5,
      slidesToSlide: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 465 },
      items: 3,
      slidesToSlide: 1 
    },
    tabletHorizontal: {
      breakpoint: { max: 1400, min: 1025 },
      items: 3,
      slidesToSlide: 1 
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 3,
      slidesToSlide: 1 // optional, default to 1.
    }
  };
  
  return (
      movies && movies.length > 0 ?
      <Carousel
      ssr={true} 
      containerClass="h-48 md:h-72 lg:h-96 w-full mt-6 z-0"
      autoPlay={false}
      transitionDuration={500}
      draggable={isMobileView ? true : false}
      infinite={true} 
      responsive={responsive} 
      >
        {movies.map((movie, index) => (
          <MovieItemCarousel key={index} locale={locale} movie={movie} image={movie.image}  id={movie.id} />
        ))}
      </Carousel>
      : null
  )
}

export default MoviesHomeSection