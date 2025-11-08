'use client';
import { Button } from '@/domains/ui/components/button/button';
import { logError } from '@/lib/errors';
import { useMovieFormStore } from '@/store/movie/movie-store';
import useUserStore from '@/store/user/user-store';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import qs from 'qs';
import { useGetMoviesInfiniteScroll } from '../../hooks/use-get-all-image-infinite-scroll';
import MovieCardSearchPageMobileView from '../movie-card-mobile-view_search-page/movie-card-mobile-view_search-page';
import MovieCardSearchPage from '../movie-card_search-page/movie-card_search-page';

const LoadingSpinner = dynamic(
  () => import('@/domains/shared/components/loading-spinner/loading-spinner')
);

interface SearchParams {
  subtitles?: string;
  language?: string;
  decade?: string;
  genre?: string;
  q?: string;
}

const Movies = ({
  offset,
  viewport,
}: {
  searchParams?: SearchParams | undefined;
  offset?: number;
  viewport?: string;
}) => {
  const { user } = useUserStore();
  const { moviesFromStore, setMoviesStore } = useMovieFormStore();
  const searchParams: ReadonlyURLSearchParams = useSearchParams();
  const searchQuery = qs.stringify({
    subtitles: searchParams.get('subtitles') || undefined,
    language: searchParams.get('language') || undefined,
    decade: searchParams.get('decade')
      ? Number(searchParams.get('decade'))
      : undefined,
    genre: searchParams.get('genre') || undefined,
    q: searchParams.get('q') || undefined,
  });

  const {
    data,
    isFetching,
    status,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetMoviesInfiniteScroll({
    pageParam: offset,
    search: searchQuery,
  });

  const t = useTranslations('MoviesPage');

  const fetchNextMovie = async () => {
    try {
      if (!isFetchingNextPage && hasNextPage) {
        const res = await fetchNextPage();
        if (res?.data?.pages) {
          const newMovies =
            res.data.pages[res.data.pages.length - 1]?.movies ?? [];
          setMoviesStore(newMovies);
        }
      }
    } catch (error) {
      logError(error, 'fetchNextMovie');
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
                  priority={index < 6}
                  key={movie?.id + '-' + index}
                />
              ) : (
                <MovieCardSearchPageMobileView
                  user={user}
                  movie={movie}
                  priority={index < 6}
                  key={movie?.title + '-' + index + '-mobile-view'}
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
            onClick={async () => await fetchNextMovie()}
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
