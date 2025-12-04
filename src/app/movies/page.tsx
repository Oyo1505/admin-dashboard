import MovieFilters from '@/domains/movies/components/movies-filters/movies-filters';
import Movies from '@/domains/movies/components/movies/movies';
import SearchMovie from '@/domains/movies/components/search-movie/search-movie';
import MoviesSkeleton from '@/domains/skeleton/components/movies-skeleton/movies-skeleton';
import { GenreData } from '@/lib/data/genres';
import { MovieData } from '@/lib/data/movies';

import { Suspense, cache } from 'react';

const getData = cache(async () => {
  const { genres } = await GenreData.getAllGenres();
  const { countries } = await MovieData.getMoviesCountries();
  return { genres, countries };
});

const Page = async (props: {
  searchParams: Promise<{
    language: string;
    q: string;
    subtitles: string;
    langage: string;
    genre: string;
    decade: string;
    viewport: string;
  }>;
}) => {
  const searchParams = await props.searchParams;
  const { genres, countries } = await getData();
  const search = searchParams.q ?? '';
  const offset = 12;
  const { viewport } = searchParams;

  return (
    <>
      <h1 className="sr-only">Movies</h1>
      <SearchMovie search={search} />
      <MovieFilters genres={genres} countries={countries ?? []} />
      <Suspense fallback={<MoviesSkeleton />}>
        <Movies offset={offset} viewport={viewport} />
      </Suspense>
    </>
  );
};

export default Page;
