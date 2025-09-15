'use client';
import { Button } from '@/domains/ui/components/button/button';
import { Favorite } from '@/domains/ui/components/icons/icons';
import { logError } from '@/lib/errors';
import { URL_MOVIE_ID } from '@/shared/route';
import {
  useFiltersMovieStore,
  useMovieFormStore,
} from '@/store/movie/movie-store';
import useUserStore from '@/store/user/user-store';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import qs from 'qs';
import { useEffect, useMemo } from 'react';
import { titleOnlocale } from '@/shared/utils/string/titleOnlocale';
import { useGetMoviesInfiniteScroll } from '../../hooks/use-get-all-image-infinite-scroll';

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
}: {
  searchParams?: SearchParams | undefined;
  offset?: number;
}) => {
  const { filters } = useFiltersMovieStore();
  const { user } = useUserStore();
  const { moviesFromStore, setMoviesStore } = useMovieFormStore();
  const locale = useLocale();
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
      searchParams && Object.keys(searchParams).length > 0
        ? qs.stringify({
            subtitles:
              filters?.subtitles && filters?.subtitles?.length > 0
                ? filters?.subtitles
                : searchParams.subtitles
                  ? searchParams.subtitles
                  : undefined,
            language:
              filters?.language && filters?.language?.length > 0
                ? filters?.language
                : searchParams.language
                  ? searchParams.language
                  : undefined,
            decade:
              filters?.decade && filters?.decade > 0
                ? filters?.decade
                : Number(searchParams.decade) > 0
                  ? Number(searchParams.decade)
                  : undefined,
            genre:
              filters?.genre && filters?.genre?.length > 0
                ? filters?.genre
                : searchParams.genre
                  ? searchParams.genre
                  : undefined,
            q:
              filters?.q && filters?.q?.length > 0
                ? filters?.q
                : searchParams.q
                  ? searchParams.q
                  : undefined,
          })
        : '',
  });

  const t = useTranslations('MoviesPage');

  const filteredMovies = useMemo(() => {
    if (status === 'success') {
      if (searchParams && Object.keys(searchParams).length > 0) {
        return data?.pages[data.pages.length - 1]?.movies || [];
      } else if (searchParams && Object.keys(searchParams)?.length === 0) {
        return data?.pages[0]?.movies || [];
      }
    }

    return [];
  }, [data, searchParams, status]);

  useEffect(() => {
    if (filteredMovies?.length > 0) {
      setMoviesStore(filteredMovies);
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
  const isFavorite = (id: string) => {
    return user?.favoriteMovies?.some(
      (favoriteMovie) => favoriteMovie.movieId === id
    );
  };
  return (
    <>
      {moviesFromStore && moviesFromStore.length > 0 ? (
        <div className="grid grid-cols-1 mx-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4 mt-6">
          {moviesFromStore.map(
            (movie, index) =>
              movie?.title && (
                <Link
                  prefetch
                  className="w-52 relative group flex h-full flex-col gap-3 justify-start items-center transition-all duration-300 pb-5"
                  key={`${movie?.title.toLowerCase().replaceAll(' ', '-')}-${index}`}
                  href={`${URL_MOVIE_ID(movie?.id)}`}
                >
                  {isFavorite(movie?.id) && (
                    <div className="absolute z-1 top-1 right-1">
                      <Favorite fill />
                    </div>
                  )}
                  <div className="flex relative w-full rounded-lg flex-col justify-between h-full">
                    <div className="w-full h-72 rounded-lg relative overflow-hidden">
                      <Image
                        priority
                        className="w-full h-full rounded-lg transform transition-transform duration-300 group-hover:scale-110"
                        src={movie?.image ? movie?.image : 'imageDefault'}
                        width={300}
                        height={200}
                        alt="movie"
                      />
                    </div>
                  </div>
                  <div className="w-full text-center text-ellipsis whitespace-nowrap overflow-hidden">
                    {titleOnlocale(movie, locale)}
                  </div>
                </Link>
              )
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
