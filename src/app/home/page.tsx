import { getFavoriteMovies } from '@/components/dashboard/action'
import {  getLastFiveMovies, getMoviesByARandomCountry, getMoviesByARandomGenre } from '@/components/movies/action'
import MoviesHomeSection from '@/components/movies/components/movies-home-section/movies-home-section'
import Title from '@/components/ui/components/title/title'
import React from 'react'

const Page =  async() => {
  
  const [
    moviesLastFive,
    { movies: moviesByARandomCountry, country },
    { movies: moviesByARandomGenre, genre },
    { movies: favorites }
  ] = await Promise.all([
    getLastFiveMovies(),
    getMoviesByARandomCountry(),
    getMoviesByARandomGenre(),
    getFavoriteMovies("clzl1br370003zt5x1ipm2ojv")
  ]);
  const extractFavoriteMovie = favorites?.map((movie) => movie.movie)

  return (
    <div className='flex flex-col mt-6 gap-4 md:gap-8'>
      <div>
        <Title translationTheme='HomePage' className='text-2xl' translationText='lastFiveMovies' type='h2' />
        <MoviesHomeSection movies={moviesLastFive.movies} />
      </div>
      <div>
        <Title translationTheme='HomePage' className='text-2xl' translationText='ACountry' type='h2'> {country}</Title>
        <MoviesHomeSection movies={moviesByARandomCountry} />
      </div>
      <div>
        <Title translationTheme='HomePage' className='text-2xl' translationText='Akind' type='h2'> {genre}</Title>
        <MoviesHomeSection movies={moviesByARandomGenre} />
      </div>
      <div>
        <Title translationTheme='HomePage' className='text-2xl' translationText='AHeart' type='h2' />
        <MoviesHomeSection movies={extractFavoriteMovie} />
      </div>
      {/* <div>
        <Title translationTheme='HomePage' translationText='MyTopTen' type='h2' />
      </div> */}
    </div>
  )
}

export default Page