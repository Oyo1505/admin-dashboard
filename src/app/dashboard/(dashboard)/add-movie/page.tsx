
import { addMovieToDb } from '@/components/dashboard/action';
import MovieTable from '@/components/dashboard/components/movie-table/movie-table';
import { getData } from '@/googleDrive';
import { IMovie, IMovieFileGoogleDrive } from '@/models/movie/movie';
import { URL_ADD_MOVIE } from '@/shared/route';
import { revalidatePath } from 'next/cache';
import React from 'react'

const Page = async () => {

  const { movies } = await getData() as {movies: IMovieFileGoogleDrive[]}
  async function createMovie(formData: IMovie) {
    'use server'
    const rawFormData = {
      title: formData.title,
      idGoogleDive: formData.idGoogleDive,
      releaseDate: Date.now(),
      year: formData.year,
      genre: formData.genre,
      country: formData.country,
      synopsis: formData.synopsis,
      trailer: formData.trailer,
      link: formData.link,
 
    }
    //@ts-ignore
   await addMovieToDb(rawFormData)
   revalidatePath(URL_ADD_MOVIE)
  }

    return <MovieTable movies={movies} createMovie={createMovie} />
}

export default Page