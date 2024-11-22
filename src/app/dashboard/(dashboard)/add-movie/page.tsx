import { getAllMovies } from '@/components/dashboard/action';
import MovieTable from '@/components/dashboard/components/movie-table/movie-table';
import { addFileToGoogleDriveAction, getDataFromGoogleDrive } from '@/googleDrive';
import { IMovie } from '@/models/movie/movie';
import React from 'react';

export const revalidate = 60;

const Page = async () => {
  const { movies } = await getDataFromGoogleDrive() as {movies: IMovie[]}
  const { movieInDb } = await getAllMovies();
  
    return <MovieTable movies={movies}  movieInDb={movieInDb as IMovie[]} />
}

export default Page