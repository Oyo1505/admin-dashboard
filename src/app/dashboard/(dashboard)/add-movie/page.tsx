import { getAllMovies } from '@/components/dashboard/action';
import MovieTable from '@/components/dashboard/components/movie-table/movie-table';
import { getData } from '@/googleDrive';
import { IMovie } from '@/models/movie/movie';
import React from 'react';

export const revalidate = 60;

export async function getDataPage() {
  const { movies } = await getData() as {movies: IMovie[]}
  const { movieInDb } = await getAllMovies()

  return {movies, movieInDb}
}

const Page = async () => {
    const {movies, movieInDb} = await getDataPage()

    return <MovieTable movies={movies} movieInDb={movieInDb as any}  />
}

export default Page