import { getFavoriteMovies } from '@/domains/dashboard/actions/movie';
import { getMovieDetail } from '@/domains/movies/actions/movie';
import MovieHeader from '@/domains/movies/components/movie-header/movie-header';
import MoviePageButtons from '@/domains/movies/components/movie-page_buttons/movie-page_buttons';
import MoviePlayerIframe from '@/domains/movies/components/movie-player-iframe/movie-player-iframe';
import { WatchTracker } from '@/domains/movies/components/movie_watch-tracker/watch-tracker';
import MovieCarouselSuggestion from '@/domains/movies/components/movies-carrousel-suggestion/movies-carrousel-suggestion';
import Title from '@/domains/ui/components/title/title';
import { getServerSession } from '@/lib/auth';
import { MovieData } from '@/lib/data/movies';
import VideoPlayerYoutube from '@/shared/components/video-player-youtube/video-player-youtube';
import clsx from 'clsx';
import { Lobster } from 'next/font/google';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { Activity, Suspense, cache } from 'react';
import Loading from './loading';

const lobster = Lobster({
  weight: '400',
  display: 'swap',
  subsets: ['latin'],
});

export const revalidate = 60;

export const dynamicParams = true;

export async function generateStaticParams() {
  const { movieInDb } = await MovieData.getAllMoviesWithGenres();
  return (movieInDb ?? []).map((movie) => ({
    name: movie.id,
  }));
}

const getMovie = cache(async (name: string) => {
  const { movie, suggestedMovies } = await getMovieDetail(name);
  if (!movie) notFound();
  return { movie, suggestedMovies };
});

const Page = async ({ params }: { params: Promise<{ name: string }> }) => {
  const { name } = await params;
  const userAgent = (await headers()).get('user-agent');
  const isMobileView = Boolean(
    userAgent?.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  );

  // Parallel fetch: movie data and session are independent
  const [movieData, session] = await Promise.all([
    getMovie(name),
    getServerSession(),
  ]);
  const { movie, suggestedMovies } = movieData;

  // Favorites depend on session, so must be sequential
  const favoriteMovives = !session?.user?.id
    ? null
    : await getFavoriteMovies(session.user.id);

  const isFavorite = Boolean(
    favoriteMovives?.movies?.find(
      (movieFromDb: { movieId: string }) => movieFromDb.movieId === movie?.id
    )
  );

  return (
    <div className="h-auto pt-6 flex flex-col justify-start items-start">
      <Suspense fallback={<Loading />}>
        <div className="justify-center items-center w-full flex lg:flex-row lg:justify-start lg:items-start  lg:gap-4 flex-col">
          <Activity mode={movie ? 'visible' : 'hidden'}>
            <WatchTracker movieId={movie.id} />
            <div className="lg:grow-0 w-full mb-4 lg:mb-0">
              {movie?.idGoogleDive && <MoviePlayerIframe movie={movie} />}
              <MoviePageButtons isFavorite={isFavorite} movie={movie} />
            </div>
          </Activity>
          <MovieHeader movie={movie} />
        </div>
      </Suspense>
      <div className="w-full  mt-14 mb-10 flex gap-7 flex-col lg:flex-row">
        <Suspense fallback={<Loading />}>
          <Activity mode={movie && movie?.trailer ? 'visible' : 'hidden'}>
            <div className="h-96 w-full lg:w-1/2">
              <Title
                translationTheme="MoviePage"
                className={clsx(lobster.className, 'text-2xl md:text-3xl')}
                translationText="trailer"
                type="h2"
              />
              {movie?.trailer && <VideoPlayerYoutube movie={movie?.trailer} />}
            </div>
          </Activity>
          <Suspense fallback={<Loading />}>
            <Activity
              mode={
                suggestedMovies && suggestedMovies?.length > 0
                  ? 'visible'
                  : 'hidden'
              }
            >
              <div className="h-full w-full mt-10 lg:mt-0 lg:w-1/2">
                <Title
                  translationTheme="MoviePage"
                  className={clsx(lobster.className, 'text-2xl md:text-3xl')}
                  translationText="Suggestion"
                  type="h2"
                />
                <MovieCarouselSuggestion
                  movies={suggestedMovies}
                  isMobileView={isMobileView}
                />
              </div>
            </Activity>
          </Suspense>
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
