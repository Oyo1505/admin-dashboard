import { getAllMovies } from '@/components/dashboard/action';
import MovieTable from '@/components/dashboard/components/movie-table/movie-table';
import { addFileToGoogleDriveAction, getDataFromGoogleDrive } from '@/googleDrive';
import { IMovie } from '@/models/movie/movie';
import React from 'react';

export const revalidate = 60;

const Page = async () => {
  const { movies } = await getDataFromGoogleDrive() as {movies: IMovie[]}
  const { movieInDb } = await getAllMovies();
  
  const handleSubmitGoogleDrive = async (formData: FormData) => {
    'use server';
    try {
      const res = await addFileToGoogleDriveAction(formData);
      return res;
    } catch (error) {
      console.log(error);
    }
  }
    return <MovieTable movies={movies} handleSubmitGoogleDrive={handleSubmitGoogleDrive} movieInDb={movieInDb as IMovie[]} />
}

export default Page