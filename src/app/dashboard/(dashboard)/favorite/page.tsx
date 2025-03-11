export const revalidate = 60;
import React from 'react'
import { auth } from '@/lib/auth';
import { getFavoriteMovies } from '@/domains/dashboard/action';
import Title from '@/domains/ui/components/title/title';
import { IMovie } from '@/models/movie/movie';
import MoviesFavorite from '@/domains/movies/components/movies-favorite/movies-favorite';

async function getData() {
  const session = await auth()
  
  if (!session?.user?.id) return { movies: [] }
  
  const response = await getFavoriteMovies(session.user.id)
  return { movies: response.movies }
}

const Page = async () => {
  const { movies } = await getData()
  const moviesArray = movies?.map((movie: { movie: IMovie; }) => movie?.movie)
  return (
    <main className="flex flex-1 flex-col gap-4 md:gap-8 md:p-6" role="main" aria-label="Page des favoris">
      <div role="region" aria-label="Section des films favoris">
        <Title type='h1' translationTheme='DashboardNav' className="text-3xl" translationText='favorite' />
        <MoviesFavorite movies={moviesArray} />
      </div>
    </main>
  )
}

export default Page