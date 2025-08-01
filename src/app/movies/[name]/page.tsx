import { getFavoriteMovies } from '@/domains/dashboard/action'
import { getAllMovies, getMovieDetail } from '@/domains/movies/action'
import MovieHeader from '@/domains/movies/components/movie-header/movie-header'
import MovieCarouselSuggestion from '@/domains/movies/components/movies-carrousel-suggestion/movies-carrousel-suggestion'
import LoadingSpinner from '@/domains/shared/loading-spinner/loading-spinner'
import Title from '@/domains/ui/components/title/title'
import { auth } from '@/lib/auth'
import VideoPlayerYoutube from '@/shared/components/video-player-youtube/video-player-youtube'
import clsx from 'clsx'
import { Lobster } from 'next/font/google'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { Suspense, cache } from 'react'
import Iframe from 'react-iframe'
import Loading from './loading'

const lobster = Lobster({
  weight: '400',
  display: 'swap',
  subsets: ['latin'],
});

export const revalidate = 60;

export const dynamicParams = true

export async function generateStaticParams() {
  const { movieInDb } = await getAllMovies()
  return movieInDb?.map((movie) => ({
    name: movie.id,
  }))
}


const getMovie = cache(async(name: string) => {
  const { movie, suggestedMovies } =  await getMovieDetail(name)
  if (!movie) notFound()
  return { movie, suggestedMovies }
})

const Page = async ({
  params,
}: {
  params: Promise<{ name: string }>
}) => {

  const { name } = await params;
  const userAgent =  (await headers()).get('user-agent');
  const isMobileView = Boolean(userAgent?.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));

  const { movie,suggestedMovies } = await getMovie(name)
  const session = await auth();

  const favoriteMovives = !session?.user?.id ? null : await getFavoriteMovies(session.user.id);

  const isFavorite = Boolean(favoriteMovives?.movies?.find((movieFromDb: { movieId: string }) => movieFromDb.movieId === movie?.id));

  return (
  <div className='h-auto pt-6 flex flex-col justify-start items-start'>
  <Suspense fallback={<Loading />}>
      <div className='justify-center items-center w-full flex lg:flex-row lg:justify-start lg:items-start  lg:gap-4 flex-col '>
      {movie &&
      <div className='lg:grow-0 w-full'>
          {movie?.idGoogleDive &&
          <Iframe
            url={`https://drive.google.com/file/d/${movie?.idGoogleDive}/preview`}
            className='w-full md:h-[400px] lg:w-full h-[250px] lg:h-[450px]'
            width="auto"
            height="450px"
            ariaLabel="video player"
            />}
        </div>
      }
      <MovieHeader movie={movie} isFavorite={isFavorite}/>
    </div>
  </Suspense>
  <div className='w-full  mt-14 mb-10 flex gap-7 flex-col lg:flex-row'>

    {movie && movie?.trailer &&
    <>
      <div className='h-96 w-full lg:w-1/2'>
        <Title translationTheme='MoviePage' className={clsx(lobster.className,'text-2xl md:text-3xl')} translationText='trailer' type='h2' />
        <VideoPlayerYoutube movie={movie?.trailer} />
      </div>
    </>
    }
    {suggestedMovies && suggestedMovies?.length > 0 ?
      <Suspense fallback={<LoadingSpinner />}>
        <div className='h-full w-full mt-10 lg:mt-0 lg:w-1/2'>
          <Title translationTheme='MoviePage' className={clsx(lobster.className,'text-2xl md:text-3xl')} translationText='Suggestion' type='h2' />
          <MovieCarouselSuggestion movies={suggestedMovies}  isMobileView={isMobileView}/>
        </div>
        </Suspense>
    : null}
  </div>
</div>
  )
}

export default Page
