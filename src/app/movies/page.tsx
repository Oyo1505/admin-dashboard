import { getMoviesGenre } from '@/components/movies/action';
import MovieFilters from '@/components/movies/components/movies-filters/movies-filters';
import Movies from '@/components/movies/components/movies/movies'
import SearchMovie from '@/components/movies/components/search-movie/search-movie'
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';
import React, { Suspense } from 'react'

 const Page  = async ({
  searchParams
}: {
  searchParams: {
    language: string; q: string; subtitles: string; langage: string, genre: string
};
})=> {
  const search = searchParams.q ?? '';
  const subtitles = searchParams.subtitles ?? '';
  const language = searchParams.language ?? '';
  const genre = searchParams.genre ?? '';
  const { genres } = await getMoviesGenre();
  const genresWithNoDuplicates = genres?.filter((item, index) => genres.indexOf(item) === index && item !== '');
  
  return (<>
      <SearchMovie search={search}  />
      <MovieFilters subtitles={subtitles} offset={10} language={language} genres={genresWithNoDuplicates} genre={genre} />
      <Suspense fallback={<LoadingSpinner />}>
        <Movies searchParams={searchParams} offset={10} />
      </Suspense>
    </>
)
}


export default Page