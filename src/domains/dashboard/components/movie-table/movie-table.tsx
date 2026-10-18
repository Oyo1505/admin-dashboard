'use client';
import Loading from '@/app/loading';
import useGetMoviesPagination from '@/domains/movies/hooks/use-get-movies-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/domains/ui/components/table/table';
import { IMovie } from '@/models/movie/movie';
import { MoviePublishFilter } from '@/models/movie/movie-filters';
import { ADMIN_MOVIES_PAGE_SIZE } from '@/shared/constants/pagination';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { useTranslations } from 'next-intl';
import { Activity, useState } from 'react';
import useGetMoviesFromGoogleDrive from '../../hooks/useGetMoviesFromGoogleDrive';
import MovieRow from '../movie-row/movie-row';
import MovieTablePagination from '../movie-table_pagination/movie-table_pagination';
import MovieTableToolbar from '../movie-table_toolbar/movie-table_toolbar';

const SECTION_CLASS =
  'border bg-primary text-background shadow-xs rounded-lg w-full min-w-0 overflow-x-auto';
const HEADER_ROW_CLASS = 'border-b border-background border-opacity-20';

const MovieTable = () => {
  const t = useTranslations('Dashboard');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [publish, setPublish] = useState<MoviePublishFilter>('all');
  const debouncedSearch = useDebouncedValue(search);

  const { data: moviesFromGoogle, isLoading } = useGetMoviesFromGoogleDrive();
  const {
    data: moviesFromPrisma,
    isPlaceholderData,
    isFetching,
  } = useGetMoviesPagination({ page, search: debouncedSearch, publish });

  const movies = moviesFromPrisma?.movies ?? [];
  const total = moviesFromPrisma?.total;
  const totalPages = Math.ceil((total ?? 0) / ADMIN_MOVIES_PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handlePublishChange = (value: MoviePublishFilter) => {
    setPublish(value);
    setPage(0);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-1 flex-col gap-6 w-full md:gap-8 md:p-6">
      <Activity mode={moviesFromGoogle?.length ? 'visible' : 'hidden'}>
        <section
          aria-labelledby="movies-not-added-title"
          className={SECTION_CLASS}
        >
          <Table>
            <TableHeader>
              <TableRow className={HEADER_ROW_CLASS}>
                <TableHead
                  id="movies-not-added-title"
                  className="max-w-37.5 font-bold"
                >
                  {t('movieNotAdded')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moviesFromGoogle?.map((movie: IMovie) => (
                <MovieRow
                  key={movie?.id}
                  movie={movie}
                  btnText={t('addButton')}
                  moviesFromGoogleDrive={true}
                />
              ))}
            </TableBody>
          </Table>
        </section>
      </Activity>

      <section
        aria-labelledby="movies-added-title"
        className="flex flex-col gap-4"
      >
        <h2 id="movies-added-title" className="text-lg font-bold text-primary">
          {t('movieAdded')}
        </h2>
        <MovieTableToolbar
          search={search}
          publish={publish}
          total={total}
          isFetching={isFetching}
          onSearchChange={handleSearchChange}
          onPublishChange={handlePublishChange}
        />
        <div className={SECTION_CLASS} aria-busy={isFetching}>
          <Table>
            <TableHeader>
              <TableRow className={HEADER_ROW_CLASS}>
                <TableHead className="font-bold">{t('titleColumn')}</TableHead>
                <TableHead className="font-bold w-32 text-center">
                  {t('togglePublished')}
                </TableHead>
                <TableHead className="font-bold text-right">
                  {t('actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movies.length > 0 ? (
                movies.map((movie: IMovie) => (
                  <MovieRow
                    key={movie?.id}
                    movie={movie}
                    btnText={t('editButton')}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center">
                    {debouncedSearch
                      ? t('noResults', { search: debouncedSearch })
                      : t('noMovie')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <MovieTablePagination
          page={page}
          totalPages={totalPages}
          isPlaceholderData={isPlaceholderData}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
};

export default MovieTable;
