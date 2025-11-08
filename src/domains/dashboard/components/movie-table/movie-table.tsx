'use client';
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
import { Suspense, useState } from 'react';
import MovieRow from '../movie-row/movie-row';

const MovieTable = ({
  moviesFromGoogleDrive,
}: {
  moviesFromGoogleDrive: IMovie[] | undefined;
}) => {
  const [page, setPage] = useState(0);
  const t = useTranslations('Dashboard');
  const { data, isPlaceholderData } = useGetMoviesPagination({
    page,
  });

  const filteredMoviesNotAdded = moviesFromGoogleDrive?.filter(
    (testMovie) =>
      !data?.movies?.some(
        (dataMovie: IMovie) => dataMovie.idGoogleDive === testMovie.id
      )
  );

  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <div className="flex flex-1 flex-col gap-4  md:gap-8 md:p-6">
        {filteredMoviesNotAdded && filteredMoviesNotAdded?.length > 0 ? (
          <form className="border  bg-primary text-background shadow-xs rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-background border-opacity-20">
                  <TableHead className="max-w-[150px] font-bold">
                    {t('movieNotAdded')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMoviesNotAdded?.map((movie) => (
                  <MovieRow key={movie?.id} movie={movie} btnText={'Ajouter'} />
                ))}
              </TableBody>
            </Table>
          </form>
        ) : null}
        {data?.movies && data.movies?.length > 0 && (
          <>
            <form className="border  bg-primary text-background shadow-xs rounded-lg mt-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-background border-opacity-20">
                    <TableHead className="max-w-[150px] font-bold">
                      {t('movieAdded')}
                    </TableHead>
                    <TableHead className="max-w-[150px] font-bold">
                      {t('togglePublished')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.movies
                    ? data.movies?.map((movie: IMovie, index: number) => (
                        <MovieRow
                          key={movie?.id}
                          movie={movie}
                          index={index + 1}
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
                  if (!isPlaceholderData && data.movies?.length === 5) {
                    setPage((old) => old + 1);
                  }
                }}
                disabled={isPlaceholderData || (data.movies?.length ?? 0) < 5}
                className="border-2 border-white text-white p-2 rounded-md cursor-pointer disabled:opacity-50"
              >
                {t('nextPage')}
              </button>
            </div>
          </>
        )}
      </div>
    </Suspense>
  );
};

export default MovieTable;
