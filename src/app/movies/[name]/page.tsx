'use client'
import dynamic from 'next/dynamic'
import React, { Suspense, useEffect, useState } from 'react'
import movies from '../../../assets/json/movies.json'
import Iframe from 'react-iframe'
import { IMovie } from '@/models/movie/movie'
const VideoPlayer = dynamic(() => import('@/components/shared/video-player'), { ssr: false })

const Page = ({params}:any) => {
  const { name }= params
  const [movie, setMovie] = useState<IMovie>()
  
  useEffect(()=> {  
    const data = movies?.categories[0].videos.filter(item => item?.title.toLowerCase().replaceAll(' ', '-') === name )[0]
    
    setMovie(data)
  }, [name]);

  return (
  <div>
   
  <Suspense fallback={<p>Loading video...</p>}>
 
  {movie && movie?.sources[0] && 
  <>

   <Iframe url='https://drive.google.com/file/d/1RejXffci857dzOlCF_cNagg2z9tX0SG8/preview' width="100%" height="100%" />
      <VideoPlayer option={{url:movie?.sources[0]}}
      style={{
          width: '600px',
          height: '400px',
          margin: '60px auto 0',
      }}
    />
     </>
  }
 
  </Suspense>
</div>
  )
}

export default Page