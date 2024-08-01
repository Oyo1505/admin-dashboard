import Movies from '@/components/movies/components/movies/movies'
import React from 'react'

 const Page = () => {
  const movies = [] as any
  return (
    <Movies movies={movies} />
  )
}


export default Page