import { getAllGenres, getMoviesCountries } from '@/domains/movies/action';
import MovieFilters from '@/domains/movies/components/movies-filters/movies-filters';
import Movies from '@/domains/movies/components/movies/movies';
import SearchMovie from '@/domains/movies/components/search-movie/search-movie';
import MoviesSkeleton from '@/domains/skeleton/components/movies-skeleton/movies-skeleton';
import { Suspense, cache } from 'react';

export const revalidate = 60;

  const getData = cache(async () => {
  const { genres } = await getAllGenres();
  const { countries } = await getMoviesCountries();

  return { genres, countries }
})

 const Page  = async (
   props: {
    searchParams: Promise<{
      language: string; q: string; subtitles: string; langage: string, genre: string, decade: string
  }>;
  }
 ) => {
   const searchParams = await props.searchParams;
   const { genres, countries } = await getData();
   const search = searchParams.q ?? '';
   const subtitles = searchParams.subtitles ?? '';
   const language = searchParams.language ?? '';
   const genre = searchParams.genre ?? '';
   const decade = Number(searchParams.decade) ?? 0;
   const offset = 12

   return (<>
       <SearchMovie search={search} offset={offset} />
       <MovieFilters subtitles={subtitles} q={search} offset={offset} decadeParams={decade} language={language} genres={genres ?? []} genre={genre}  countries={countries ?? []}/>
       <Suspense fallback={<MoviesSkeleton />}>
         <Movies searchParams={searchParams} offset={offset} />
       </Suspense>
     </>
 )
 }


export default Page
