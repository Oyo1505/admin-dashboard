import GenreForm from '@/components/dashboard/components/genre-form/genre-form'
import { GenreList } from '@/components/dashboard/components/genre-list/genre-list';
import { getAllGenres } from '@/components/movies/action';
import Container from '@/components/ui/components/container/container'
import Title from '@/components/ui/components/title/title';
import React from 'react'

const revalidate = 60;

const getData = async () => {
  const { genres } = await getAllGenres();
  return { genres };
} 

const Page = async () => {
  const { genres } = await getData();

  return (
    <Container className='flex flex-col gap-6'>
      <Title type='h1' translationTheme='GenrePage' translationText='title'  className='text-2xl' />
      <GenreList genres={genres} />
      <GenreForm /> 
    </Container>
  )
}

export default Page