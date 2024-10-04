
import { getAllMovies } from '@/components/dashboard/action';
import MovieTable from '@/components/dashboard/components/movie-table/movie-table';
import { getData } from '@/googleDrive';
import { IMovie } from '@/models/movie/movie';

import React from 'react'

const Page = async () => {
  const { movies } = await getData() as {movies: IMovie[]}
  const { movieInDb } = await getAllMovies()
 
    return <MovieTable movies={movies} movieInDb={movieInDb as any}  />
}

export default Page