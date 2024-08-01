import React from 'react'
import MovieSingle from '../movie-single/movie-single'

interface IMovie {
  movies: any[]
}
 
const Movies = ({movies}:IMovie) => {
  
  return (
    <div>{movies && movies?.length > 0 ? movies?.map((movie, index) => <MovieSingle key={index} movie={movie} /> ) : 'Pas de film disponible'}</div>
  )
}

export default Movies