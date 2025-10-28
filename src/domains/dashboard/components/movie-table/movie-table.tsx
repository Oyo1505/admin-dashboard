'use client';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/domains/ui/components/table/table';
import { IMovie } from '@/models/movie/movie';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import MovieRow from '../movie-row/movie-row';

const MovieTable = ({
  movies,
  movieInDb,
}: {
  movies: IMovie[] | undefined;
  movieInDb: IMovie[];
}) => {
  const t = useTranslations('Dashboard');
  const filteredMoviesNotAdded = movies?.filter(
    (testMovie) =>
      !movieInDb?.some((dataMovie) => dataMovie.idGoogleDive === testMovie.id)
  );
  const filteredMoviesAdded = movieInDb?.filter((testMovie) =>
    movies?.some((dataMovie) => dataMovie.id === testMovie.idGoogleDive)
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
        {filteredMoviesAdded && filteredMoviesAdded?.length > 0 && (
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
                  {filteredMoviesAdded
                    ? filteredMoviesAdded?.map((movie, index) => (
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
          </>
        )}
      </div>
    </Suspense>
  );
};

export default MovieTable;
