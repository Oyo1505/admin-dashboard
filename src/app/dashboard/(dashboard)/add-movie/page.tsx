
import MovieTable from '@/components/dashboard/components/movie-table/movie-table';
import {  getData } from '@/googleDrive';
import { IMovie } from '@/models/movie/movie';
import React from 'react'

const Page = async () => {
  const movies = [
  {
    id:'fjsf',
    title:'Film de merde',
    sources: ['https://fr.web.img6.acsta.net/img/f5/4c/f54c3310f101fe8ae4bba9e566bca1b5.jpg']
  }] as IMovie[]
  const data = await getData()
  console.log(data)
    return (<>
    <button >Upload</button>
    <MovieTable movies={movies} />
    </>
  )
}

export default Page