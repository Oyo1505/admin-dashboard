'use client'
import React, { Suspense } from 'react'
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import MovieItemCarousel from '../movie-item-carousel/movie-item-carousel';
import { IMovie } from '@/models/movie/movie';

import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';
import { useLocale } from 'next-intl';

const MoviesHomeTheme = ({ movies }:{movies?:IMovie[]}) => {

 const locale = useLocale()

  return ( 
    <Suspense fallback={<LoadingSpinner />}>
       {movies && movies.length > 0 ?
        movies.map((movie, index) => (
          <MovieItemCarousel key={index} locale={locale} movie={movie} image={movie.image}  id={movie.id} />
        ))
      : null}
    </Suspense>
  )
}

export default MoviesHomeTheme