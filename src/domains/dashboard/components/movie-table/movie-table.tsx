'use client';
import Loading from '@/app/loading';
import useGetMoviesPagination from '@/domains/movies/hooks/use-get-movies-pagination';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/domains/ui/components/table/table';
import { IMovie } from '@/models/movie/movie';
import { useTranslations } from 'next-intl';
import { Activity, Suspense, useState } from 'react';
import useGetMoviesFromGoogleDrive from '../../hooks/useGetMoviesFromGoogleDrive';
import MovieRow from '../movie-row/movie-row';

const MovieTable = () => {
  const [page, setPage] = useState(0);
  const t = useTranslations('Dashboard');
  const {
    data: moviesFromGoogle,
    isLoading,
    error,
  } = useGetMoviesFromGoogleDrive();
  const { data: moviesFromPrisma, isPlaceholderData } = useGetMoviesPagination({
    page,
  });
  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="p-4 text-red-500">
        Failed to load movies from Google Drive
      </div>
    );
  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-1 flex-col gap-4 w-full md:gap-8 md:p-6">
        <Activity
          mode={
            moviesFromGoogle && moviesFromGoogle?.length > 0 && !isLoading
              ? 'visible'
              : 'hidden'
          }
        >
          <form className="border bg-primary text-background shadow-xs rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-background border-opacity-20">
                  <TableHead className="max-w-[150px] font-bold">
                    {t('movieNotAdded')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moviesFromGoogle?.map((movie: IMovie) => (
                  <MovieRow
                    key={movie?.id}
                    movie={movie}
                    btnText={'Ajouter'}
                    moviesFromGoogleDrive={true}
                  />
                ))}
              </TableBody>
            </Table>
          </form>
        </Activity>

        <Activity
          mode={
            moviesFromPrisma?.movies && moviesFromPrisma.movies?.length > 0
              ? 'visible'
              : 'hidden'
          }
        >
          <form className="border bg-primary text-background shadow-xs rounded-lg  mt-4 w-full min-w-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-background border-opacity-20">
                  <TableHead className="font-bold">{t('movieAdded')}</TableHead>
                  <TableHead className="font-bold w-32 text-center">
                    {t('togglePublished')}
                  </TableHead>
                  <TableHead className="font-bold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moviesFromPrisma.movies
                  ? moviesFromPrisma.movies?.map((movie: IMovie) => (
                      <MovieRow
                        key={movie?.id}
                        movie={movie}
                        btnText={'Editer'}
                      />
                    ))
                  : t('noMovie')}
              </TableBody>
            </Table>
          </form>
          <div className="flex gap-4 mt-4 justify-center">
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 0))}
              disabled={page === 0}
              className="border-2 border-white text-white p-2 rounded-md cursor-pointer disabled:opacity-50"
            >
              {t('previousPage')}
            </button>
            <button
              onClick={() => {
                if (
                  !isPlaceholderData &&
                  moviesFromPrisma.movies?.length === 5
                ) {
                  setPage((old) => old + 1);
                }
              }}
              disabled={
                isPlaceholderData || (moviesFromPrisma.movies?.length ?? 0) < 5
              }
              className="border-2 border-white text-white p-2 rounded-md cursor-pointer disabled:opacity-50"
            >
              {t('nextPage')}
            </button>
          </div>
        </Activity>
      </div>
    </Suspense>
  );
};

export default MovieTable;
