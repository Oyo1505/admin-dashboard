import { getAllMovies } from '@/components/dashboard/action';
import MovieTable from '@/components/dashboard/components/movie-table/movie-table';
import { getDataFromGoogleDrive } from '@/googleDrive';
import { IMovie } from '@/models/movie/movie';
import React from 'react';

export const revalidate = 60;

export async function getData() {
  const { movies } = await getDataFromGoogleDrive() as {movies: IMovie[]}
  const { movieInDb } = await getAllMovies()

  return {movies, movieInDb}
}

const Page = async () => {
    const {movies, movieInDb} = await getData()

    return <MovieTable movies={movies} movieInDb={movieInDb as any}  />
}

export default Page