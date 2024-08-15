import { getFavoriteMovies } from '@/components/dashboard/action'
import {  getLastMovies, getMoviesByARandomCountry, getMoviesByARandomGenre } from '@/components/movies/action'
import MoviesHomeSection from '@/components/movies/components/movies-home-section/movies-home-section'
import Title from '@/components/ui/components/title/title'
import React from 'react'
import countriesList from '@/shared/constants/countries';

import { getLocale } from 'next-intl/server'
const Page =  async() => {
  const locale = await getLocale();
  const [
    moviesLastFive,
    { movies: moviesByARandomCountry, country },
    { movies: moviesByARandomGenre, genre },
    { movies: favorites }
  ] = await Promise.all([
    getLastMovies(),
    getMoviesByARandomCountry(),
    getMoviesByARandomGenre(),
    getFavoriteMovies("clzl1br370003zt5x1ipm2ojv")
  ]);
  const extractFavoriteMovie = favorites?.map((movie) => movie.movie)
  const findCountry = countriesList?.filter((movie) => movie?.value === country)
  
  return (
    <div className='flex flex-col mt-6 gap-4 md:gap-8'>
      <div>
        <Title translationTheme='HomePage' className='text-3xl' translationText='lastFiveMovies' type='h3' />
        <MoviesHomeSection movies={moviesLastFive.movies} />
      </div>
      <div>
        
        <Title translationTheme='HomePage' className='text-3xl' translationText='ACountry'type='h3'> {
        //@ts-ignore
        findCountry?.[0]?.label?.[locale]
        }</Title>
        <MoviesHomeSection movies={moviesByARandomCountry} />
      </div>
      <div>
        <Title translationTheme='HomePage' className='text-3xl' translationText='Akind'type='h3'> {genre}</Title>
        <MoviesHomeSection movies={moviesByARandomGenre} />
      </div>
      <div>
      
       {extractFavoriteMovie && extractFavoriteMovie?.length > 0 &&<>
        <Title translationTheme='HomePage' className='text-3xl' translationText='AHeart'type='h3'/>
       <MoviesHomeSection movies={extractFavoriteMovie} /></>  }
      </div>
      {/* <div>
        <Title translationTheme='HomePage' translationText='MyTopTen' type='h2' />
      </div> */}
    </div>
  )
}

export default Page