
import React from 'react'
import { auth } from '@/lib/auth';
import { getFavoriteMovies } from '@/components/dashboard/action';
import Title from '@/components/ui/components/title/title';
import { IMovie } from '@/models/movie/movie';
import MoviesFavorite from '@/components/movies/components/movies-favorite/movies-favorite';

 async function getData() {
  const session = await auth()
  //@ts-ignore
  const   { movies } = session?.user?.id &&  (await getFavoriteMovies(session?.user?.id))
  return { movies}
}

const Page = async () => {

  const { movies} = await getData()
  const moviesArray = movies?.map((movie: { movie: IMovie; }) => movie?.movie)
  return (
    <main className="flex flex-1 flex-col gap-4 md:gap-8 md:p-6">
        <Title type='h1' translationTheme='DashboardNav' className="text-3xl"  translationText='favorite' />
        <MoviesFavorite movies={moviesArray} />
    </main>
  )
}

export default Page