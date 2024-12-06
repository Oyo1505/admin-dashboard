import { PageProps } from '.next/types/app/page';
import FormMovie from '@/components/dashboard/components/form-movie/form-movie';
import { getMovieDetail } from '@/components/movies/action';
import React from 'react'

const getData = async (id:string)=>{
  try{
    const { movie } = await getMovieDetail(id)
    return movie
  }catch(err){
    console.log(err)
  }
}

const Page = async (props:PageProps) => {
  const {id} = await props.params;
  const movie = await getData(id)
  return (
    <FormMovie movie={movie} editMovie={true}/>
  )
}

export default Page