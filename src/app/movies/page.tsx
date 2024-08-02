import Movies from '@/components/movies/components/movies/movies'
import React from 'react'

import moviesJson from '../../assets/json/movies.json'
 const Page = async  () => {
  return (
    <Movies movies={moviesJson.categories[0].videos} />
  )
}


export default Page