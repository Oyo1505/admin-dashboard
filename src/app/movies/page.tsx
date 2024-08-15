import MovieFilters from '@/components/movies/components/movies-filters/movies-filters';
import Movies from '@/components/movies/components/movies/movies'
import SearchMovie from '@/components/movies/components/search-movie/search-movie'
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';
import React, { Suspense } from 'react'

 const Page  = async ({
  searchParams
}: {
  searchParams: {
    language: string; q: string; subtitles: string; langage: string 
};
})=> {
  const search = searchParams.q ?? '';
  const subtitles = searchParams.subtitles ?? '';
  const language = searchParams.language ?? '';
  
  // const { users, newOffset } = await getMo(search, offset)
  return (<>
      <SearchMovie search={search}  />
      <MovieFilters subtitles={subtitles} language={language} />
      <Suspense fallback={<LoadingSpinner />}>
        <Movies searchParams={searchParams}  />
      </Suspense>
    </>
)
}


export default Page