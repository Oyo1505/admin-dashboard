import dynamic from 'next/dynamic'
import React, { Suspense, useEffect, useState } from 'react'
import Iframe from 'react-iframe'
import { IMovie } from '@/models/movie/movie'
import { getMovieDetail } from '@/components/movies/action'
const VideoPlayer = dynamic(() => import('@/components/shared/video-player'), { ssr: false })

const Page = async ({params}:any) => {
  const { name }= params
  
  
  const {movie} = await getMovieDetail(name)
  console.log(movie?.idGoogleDive)
  return (
  <div>
   
  <Suspense fallback={<p>Loading video...</p>}>
 
  {movie && 
  <>

    <Iframe url={`https://drive.google.com/file/d/${movie?.idGoogleDive}/preview`} width="100%" height="100%" />
      {/* <VideoPlayer option={{url:movie?.sources[0]}}
      style={{
          width: '600px',
          height: '400px',
          margin: '60px auto 0',
      }}
    /> */}
     </>
  }
 
  </Suspense>
</div>
  )
}

export default Page