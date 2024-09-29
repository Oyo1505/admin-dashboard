import { getDirectorMovies, getFavoriteMovies } from '@/components/dashboard/action'
import {  getLastMovies, getMoviesByARandomCountry, getMoviesByARandomGenre } from '@/components/movies/action'
import MoviesHomeSection from '@/components/movies/components/movies-home-section/movies-home-section'
import Title from '@/components/ui/components/title/title'
import React from 'react'
import countriesList from '@/shared/constants/countries';
import { getLocale } from 'next-intl/server'
import MoviesHomeTheme from '@/components/movies/components/movies-home-theme/movies-home-theme'
import Container from '@/components/ui/components/container/container'
import { headers } from 'next/headers'
import { Lobster } from 'next/font/google'
import clsx from 'clsx'
import MoviesHomeDirector from '@/components/movies/components/movies-home-director/movies-home-director'

const lobster = Lobster({
  weight: '400',
  display: 'swap',
  subsets: ['latin'],
})
const Page =  async () => {
  const locale = await getLocale();
  const [
    moviesLastFive,
    { movies: moviesByARandomCountry, country },
    { movies: moviesByARandomGenre, genre },
    { movies: favorites },
    { directorMovies, director, imageBackdrop }
  ] = await Promise.all([
    getLastMovies(),
    getMoviesByARandomCountry(),
    getMoviesByARandomGenre(),
    getFavoriteMovies("clzl1br370003zt5x1ipm2ojv"),
    getDirectorMovies()
  ]);
  const extractFavoriteMovie = favorites?.map((movie) => movie.movie)
  const findCountry = countriesList?.filter((movie) => movie?.value === country)
  const headersList = headers();

  const userAgent = headersList.get('user-agent');
  const isMobileView = Boolean(userAgent?.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));   
//@ts-ignore
  const countryChosen = findCountry?.[0]?.label?.[locale] 
  return (
    <div className='flex flex-col mt-6 gap-8'>
      <Container className='pt-14'>
          <Title translationTheme='HomePage' className={clsx(lobster.className, 'text-2xl md:text-3xl')} translationText='lastFiveMovies' type='h3' />
          <MoviesHomeSection movies={moviesLastFive.movies} isMobileView={isMobileView} />
      </Container >
      <div>
         <MoviesHomeTheme fontFamily={lobster.className} movies={moviesByARandomCountry} isMobileView={isMobileView} country={countryChosen} />
      </div>
      <Container>
        <Title translationTheme='HomePage' className={clsx(lobster.className, 'text-2xl md:text-3xl')} translationText='Akind'type='h3'> {genre}</Title>
        <MoviesHomeSection movies={moviesByARandomGenre} isMobileView={isMobileView} />
      </Container>
      {directorMovies && directorMovies?.length > 0 && director && 
        <div>
          <MoviesHomeDirector fontFamily={lobster.className} movies={directorMovies}  isMobileView={isMobileView} director={director} imageBackdrop={imageBackdrop} />
       </div>
      }
      {extractFavoriteMovie && extractFavoriteMovie?.length > 0 &&<>
      <div className='w-full bg-primary pb-6 pt-6'>
        <Container>
          <Title translationTheme='HomePage' className={clsx(lobster.className, 'text-2xl md:text-3xl')} textColor="text-background" translationText='AHeart'type='h3'/>
          <MoviesHomeSection movies={extractFavoriteMovie}  isMobileView={isMobileView} />
        </Container>
      </div>
      </>}
    </div>
  )
}

export default Page