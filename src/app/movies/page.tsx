import Movies from '@/components/movies/components/movies/movies'
import React from 'react'

import { getAllMovies } from '@/components/dashboard/action'

 const Page = async  () => {
  const { movieInDb } = await getAllMovies()
  return (
    <Movies movies={movieInDb} />
  )
}


export default Page