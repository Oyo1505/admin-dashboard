import GenreForm from '@/domains/dashboard/components/genre-form/genre-form'
import { GenreList } from '@/domains/dashboard/components/genre-list/genre-list';
import { getAllGenres } from '@/domains/movies/action';
import Container from '@/domains/ui/components/container/container'
import Title from '@/domains/ui/components/title/title';
import React from 'react'

export const revalidate = 60;

const getData = async () => {
  const { genres } = await getAllGenres();
  return { genres };
} 

const Page = async () => {
  const { genres } = await getData();

  return (
    <Container className='flex flex-col gap-6 justify-start'>
      <Title type='h1' translationTheme='GenrePage' translationText='title'  className='text-2xl' />
      <GenreList genres={genres} />
      <GenreForm /> 
    </Container>
  )
}

export default Page