'use client';
import { Button } from '@/domains/ui/components/button/button';
import { logError } from '@/lib/errors';
import {
  useFiltersMovieStore,
  useMovieFormStore,
} from '@/store/movie/movie-store';
import useUserStore from '@/store/user/user-store';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import qs from 'qs';
import { useEffect } from 'react';
import { useGetMoviesInfiniteScroll } from '../../hooks/use-get-all-image-infinite-scroll';
import MovieCardSearchPageMobileView from '../movie-card-mobile-view_search-page/movie-card-mobile-view_search-page';
import MovieCardSearchPage from '../movie-card_search-page/movie-card_search-page';

const LoadingSpinner = dynamic(
  () => import('@/domains/shared/components/loading-spinner/loading-spinner'),
  { ssr: false }
);

interface SearchParams {
  subtitles?: string;
  language?: string;
  decade?: string;
  genre?: string;
  q?: string;
}

const Movies = ({
  searchParams,
  offset,
  viewport,
}: {
  searchParams?: SearchParams | undefined;
  offset?: number;
  viewport?: string;
}) => {
  const { filters } = useFiltersMovieStore();
  const { user } = useUserStore();
  const { moviesFromStore, setMoviesStore } = useMovieFormStore();
  const searchQuery = () => {
    if (!searchParams || Object.keys(searchParams).length === 0) return '';

    return qs.stringify({
      subtitles:
        filters && filters?.subtitles && filters?.subtitles?.length > 0
          ? filters.subtitles
          : searchParams.subtitles || undefined,
      language:
        filters && filters?.language && filters?.language?.length > 0
          ? filters.language
          : searchParams.language || undefined,
      decade:
        filters && filters?.decade && filters?.decade > 0
          ? filters.decade
          : Number(searchParams.decade) > 0
            ? Number(searchParams.decade)
            : undefined,
      genre:
        filters && filters?.genre && filters?.genre?.length > 0
          ? filters.genre
          : searchParams.genre || undefined,
      q:
        filters && filters?.q && filters?.q?.length > 0
          ? filters.q
          : searchParams.q || undefined,
    });
  };

  const {
    data,
    isFetching,
    status,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetMoviesInfiniteScroll({
    pageParam: offset,
    search:
      searchParams && Object.keys(searchParams).length > 0 ? searchQuery() : '',
  });

  const t = useTranslations('MoviesPage');

  const filteredMovies = () => {
    if (status === 'success') {
      if (searchParams && Object.keys(searchParams).length > 0) {
        return data?.pages[data.pages.length - 1]?.movies || [];
      } else if (searchParams && Object.keys(searchParams)?.length === 0) {
        return data?.pages[0]?.movies || [];
      }
    }

    return [];
  };

  useEffect(() => {
    const movies = filteredMovies();
    if (movies?.length > 0) {
      setMoviesStore(movies);
    }
  }, [filteredMovies, setMoviesStore]);

  const fecthNextMovie = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
        .then((res) => {
          if (res?.data?.pages) {
            setMoviesStore(
              res?.data.pages[res?.data?.pages?.length - 1]?.movies ?? []
            );
          } else {
            setMoviesStore([]);
          }
        })
        .catch((err) => logError(err, 'fecthNextMovie'));
    }
  };

  if (status === 'pending' && isFetching)
    return <LoadingSpinner className="flex justify-center h-screen" />;

  return (
    <>
      {moviesFromStore && moviesFromStore.length > 0 ? (
        <div className="grid grid-cols-1 md:mx-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4 mt-6">
          {moviesFromStore.map((movie, index) =>
            movie?.title ? (
              viewport === 'desktop' || viewport === 'tablet' ? (
                <MovieCardSearchPage
                  user={user}
                  movie={movie}
                  key={`${movie?.id}-${index}`}
                />
              ) : (
                <MovieCardSearchPageMobileView
                  user={user}
                  movie={movie}
                  key={`${movie?.title.toLowerCase().replaceAll(' ', '-')}-${index}-mobile-view`}
                />
              )
            ) : null
          )}
        </div>
      ) : (
        <div className=" text-center mt-14 mx-auto text-2xl">
          {t('NoMovie')}
        </div>
      )}
      <div className="flex justify-center mt-10">
        {isFetching || (isFetchingNextPage && status !== 'success') ? (
          <LoadingSpinner />
        ) : !hasNextPage ||
          (moviesFromStore && moviesFromStore.length < 12) ? null : (
          <Button
            variant={'outline'}
            onClick={() => fecthNextMovie()}
            className="min-w-80 flex align"
          >
            {t('btnLoadMore')}
          </Button>
        )}
      </div>
    </>
  );
};

export default Movies;
