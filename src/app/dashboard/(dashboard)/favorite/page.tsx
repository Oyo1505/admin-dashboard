
import React from 'react'
import { auth } from '@/lib/auth';
import { getFavoriteMovies } from '@/components/dashboard/action';
import Movies from '@/components/movies/components/movies/movies';
import Title from '@/components/ui/components/title/title';
const Page = async () => {
  const session = await auth()
  const  movie  = session?.user?.id &&  await getFavoriteMovies(session?.user?.id)
  const movies = movie?.movie?.map(movie => movie.movie)
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Title type='h1' translationTheme='DashboardNav' translationText='favorite' />
        <Movies movies={movies}/>
    </main>
  )
}

export default Page