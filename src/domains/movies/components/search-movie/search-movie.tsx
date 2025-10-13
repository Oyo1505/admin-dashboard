'use client';
import { SearchIcon } from '@/domains/ui/components/icons/icons';
import { Input } from '@/domains/ui/components/input/input';
import {
  useFiltersMovieStore,
  useMovieFormStore,
} from '@/store/movie/movie-store';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef } from 'react';
import useMovieFilters from '../../hooks/use-movie-filters';

const SearchMovie = ({
  search,
  offset,
}: {
  search: string;
  offset: number;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('Filters');
  const { filters, setFiltersData, hasBeenSearched, setHasBeenSearched } =
    useFiltersMovieStore();
  const { setMoviesStore } = useMovieFormStore();
  const [localSearch, setLocalSearch] = React.useState(search || '');

  const { queryFilterSearch } = useMovieFilters({ offset });
  const { data, status, refetch } = queryFilterSearch;
  useEffect(() => {
    if (hasBeenSearched) {
      refetch();
      setHasBeenSearched(false);
    }
  }, [hasBeenSearched, setHasBeenSearched, refetch]);

  useEffect(() => {
    if (data && data?.movies && status === 'success') {
      setMoviesStore(data?.movies);
    }
  }, [data, setMoviesStore, status]);

  const onPressEnter = () => {
    setHasBeenSearched(true);
  };
  return (
    <div className="relative mt-6 w-full md:w-4/6 m-auto">
      <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-background" />
      <Input
        ref={inputRef}
        value={localSearch}
        data-testid="input-search"
        onInput={(e) => {
          const value = (e.target as HTMLInputElement).value;
          setLocalSearch(value);
          setFiltersData({ ...filters, q: value });
        }}
        spellCheck={false}
        className="w-full bg-white shadow-none text-background appearance-none pl-8"
        placeholder={t('placeholderSearch')}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onPressEnter();
          }
        }}
      />
    </div>
  );
};

export default SearchMovie;
