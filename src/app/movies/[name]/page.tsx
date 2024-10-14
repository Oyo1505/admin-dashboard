import dynamic from 'next/dynamic'
import React, { Suspense } from 'react'
import Iframe from 'react-iframe'
import { getMovieDetail } from '@/components/movies/action'
import MovieHeader from '@/components/movies/components/movie-header/movie-header'
import Title from '@/components/ui/components/title/title'
import { auth } from '@/lib/auth'
import { getFavoriteMovies } from '@/components/dashboard/action'
import { IMovie } from '@/models/movie/movie'
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner'
import MovieCarouselSuggestion from '@/components/movies/components/movies-carrousel-suggestion/movies-carrousel-suggestion'
import { headers } from 'next/headers'
const VideoPlayerYoutube = dynamic(() => import('@/shared/components/video-player-youtube/video-player-youtube'), { ssr: false })
// const VideoPlayer = dynamic(() => import('@/components/shared/video-player'), { ssr: false })

export const revalidate = 60;  

const Page = async ({ params }:any) => {
  const headersList = headers();
  const userAgent = headersList.get('user-agent');
  const isMobileView = Boolean(userAgent?.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));   
  const { name }= params
  const { movie, suggestedMovies } = await getMovieDetail(name)
  const session = await auth();

  const favoriteMovives = session?.user?.id &&  await getFavoriteMovies(session?.user?.id)
  //@ts-ignore
  const isFavorite = favoriteMovives?.movies?.find((movieFromDb: {movieFromDb :IMovie} )=> movieFromDb?.movieId === movie?.id)
 
  return (  
  <div className='h-auto pt-6 flex flex-col justify-start items-start'>
  <Suspense fallback={<p>Loading video...</p>}>
      <div className='justify-center items-center w-full flex lg:flex-row lg:justify-start lg:items-start  lg:gap-4 flex-col '>
      {movie && 
      <div className='lg:grow-0 w-full'>
          {movie?.idGoogleDive && 
          <Iframe 
            url={`https://drive.google.com/file/d/${movie?.idGoogleDive}/preview`} 
            className='w-full md:h-[400px] lg:w-full h-[250px] lg:h-[450px]'   
            width="auto" 
            height="450px"
         
            />}

          {
          //TODO: add video player when I got a NAS
          /* <VideoPlayer option={{url:movie?.sources[0]}}
          style={{
              width: '600px',
              height: '400px',
              margin: '60px auto 0',
          }}
        /> */}
        </div>
      }
      <MovieHeader movie={movie} isFavorite={isFavorite}/>
    </div>
  </Suspense>
  <div className='w-full  mt-14 mb-10 flex gap-7 flex-col lg:flex-row'>

    {movie && movie?.trailer && 
    <>
      <div className='h-96 w-full lg:w-1/2'>
        <Title translationTheme='MoviePage' className='text-2xl md:text-3xl' translationText='trailer' type='h2' />
        <VideoPlayerYoutube movie={movie?.trailer} />  
      </div>

    </>
    }
    {suggestedMovies && suggestedMovies?.length > 0 ?
      <Suspense fallback={<LoadingSpinner />}>
        <div className='h-full w-full mt-10 lg:mt-0 lg:w-1/2'>
          <Title translationTheme='MoviePage' className={'text-2xl md:text-3xl'} translationText='Suggestion' type='h2' />
          <MovieCarouselSuggestion movies={suggestedMovies}  isMobileView={isMobileView}/>
        </div>
        </Suspense>
    : null}
  </div>
</div>
  )
}

export default Page