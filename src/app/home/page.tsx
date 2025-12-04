import { Locale } from '@/config';

import MoviesHomeDirector from '@/domains/movies/components/movies-home-director/movies-home-director';
import MoviesHomeSection from '@/domains/movies/components/movies-home-section/movies-home-section';
import MoviesHomeTheme from '@/domains/movies/components/movies-home-theme/movies-home-theme';
import { MovieService } from '@/domains/movies/services';
import MoviesHomeSectionSkeleton from '@/domains/skeleton/components/movie-home-section/movie-home-section';
import MoviesHomeThemeSkeleton from '@/domains/skeleton/components/movies-home-theme/movies-home-theme';
import Container from '@/domains/ui/components/container/container';
import Title from '@/domains/ui/components/title/title';
import { DirectorData } from '@/lib/data/director';

import { MovieData } from '@/lib/data/movies';
import { IMovie } from '@/models/movie/movie';
import countriesList from '@/shared/constants/countries';
import displayGenreTranslated from '@/shared/utils/string/displayGenreTranslated';
import clsx from 'clsx';
import { getLocale } from 'next-intl/server';
import { Lobster } from 'next/font/google';
import { headers } from 'next/headers';
import { Suspense } from 'react';
// import ChatDebug from '@/domains/chat-bot/components/chat-debug';

const lobster = Lobster({
  weight: '400',
  display: 'swap',
  subsets: ['latin'],
  preload: true,
});

async function getData() {
  const idUser = process.env.ID_USER_FAVORITES_MOVIE ?? '';
  const [
    moviesLastFive,
    moviesByARandomCountryData,
    moviesByARandomGenreData,
    favorites,
    directorMoviesData,
  ] = await Promise.all([
    MovieData.getLastMovies(),
    MovieData.getMoviesByARandomCountry(),
    MovieData.getMoviesByARandomGenre(),
    MovieService.favoriteMovies(idUser),
    DirectorData.getDirectorMovies(),
  ]);

  const { movies: moviesByARandomCountry, country } =
    moviesByARandomCountryData;
  const { movies: moviesByARandomGenre, genre } = moviesByARandomGenreData;
  const { directorMovies, director, imageBackdrop } = directorMoviesData;

  return {
    moviesLastFive,
    moviesByARandomCountry,
    moviesByARandomGenre,
    genre,
    favorites,
    directorMovies,
    country,
    director,
    imageBackdrop,
  };
}

const Page = async () => {
  const locale = (await getLocale()) as Locale;

  const {
    moviesLastFive,
    moviesByARandomCountry,
    favorites,
    directorMovies,
    moviesByARandomGenre,
    genre,
    country,
    director,
    imageBackdrop,
  } = await getData();

  const extractFavoriteMovie =
    favorites?.movies?.map((movie: { movie: IMovie }) => movie?.movie) || [];

  const findCountry = countriesList?.filter(
    (movie) => movie?.value === country
  );
  const userAgent = (await headers()).get('user-agent');
  const isMobileView = Boolean(
    userAgent?.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  );
  const countryChosen = findCountry?.[0]?.label?.[locale];
  return (
    <div className="flex flex-col mt-6 gap-8">
      <Title
        className="sr-only"
        translationTheme="HomePage"
        translationText="title"
        type="h1"
      />

      <Container className="pt-14">
        <Title
          translationTheme="HomePage"
          className={clsx(lobster.className, 'text-2xl md:text-3xl')}
          translationText="lastFiveMovies"
          type="h2"
        />
        <Suspense fallback={<MoviesHomeSectionSkeleton />}>
          <MoviesHomeSection
            movies={moviesLastFive.movies}
            isMobileView={isMobileView}
          />
        </Suspense>
      </Container>
      <div>
        <Suspense fallback={<MoviesHomeThemeSkeleton />}>
          <MoviesHomeTheme
            fontFamily={lobster.className}
            movies={moviesByARandomCountry}
            isMobileView={isMobileView}
            country={countryChosen}
          />
        </Suspense>
      </div>
      {moviesByARandomGenre && moviesByARandomGenre.length > 0 && (
        <Container>
          <Title
            translationTheme="HomePage"
            className={clsx(lobster.className, 'text-2xl md:text-3xl')}
            translationText="Akind"
            type="h2"
          >
            {' '}
            {displayGenreTranslated(genre, locale)}
          </Title>
          <Suspense fallback={<MoviesHomeSectionSkeleton />}>
            <MoviesHomeSection
              movies={moviesByARandomGenre}
              isMobileView={isMobileView}
            />
          </Suspense>
        </Container>
      )}
      <Suspense fallback={<MoviesHomeThemeSkeleton />}>
        {directorMovies && directorMovies?.length > 0 && director && (
          <div>
            <MoviesHomeDirector
              fontFamily={lobster.className}
              movies={directorMovies}
              isMobileView={isMobileView}
              director={director}
              imageBackdrop={imageBackdrop}
            />
          </div>
        )}
      </Suspense>
      {extractFavoriteMovie && extractFavoriteMovie?.length > 0 && (
        <>
          <div className="w-full bg-primary pb-6 pt-6">
            <Container>
              <Title
                translationTheme="HomePage"
                className={clsx(lobster.className, 'text-2xl md:text-3xl')}
                textColor="text-background"
                translationText="AHeart"
                type="h2"
              />
              <Suspense fallback={<MoviesHomeSectionSkeleton />}>
                <MoviesHomeSection
                  movies={extractFavoriteMovie}
                  isMobileView={isMobileView}
                />
              </Suspense>
            </Container>
          </div>
        </>
      )}
      {/*
      <Container>
        <ChatDebug />
      </Container> */}
    </div>
  );
};

export default Page;
