'use client';
import { SearchIcon } from '@/domains/ui/components/icons/icons';
import { Input } from '@/domains/ui/components/input/input';
import {
  useFiltersMovieStore,
  useMovieFormStore,
} from '@/store/movie/movie-store';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import qs from 'qs';
import React, { useEffect, useRef } from 'react';
import { fetchMovies } from '../../actions/movies';

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

  const { data, status, refetch } = useQuery({
    queryKey: ['moviesFilters', offset],
    enabled: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: () =>
      fetchMovies({
        pageParam: offset,
        search: qs.stringify({
          subtitles:
            filters?.subtitles && filters?.subtitles?.length > 0
              ? filters?.subtitles
              : undefined,
          language:
            filters?.language && filters?.language?.length > 0
              ? filters?.language
              : undefined,
          decade:
            filters?.decade && filters?.decade > 0
              ? filters?.decade
              : undefined,
          genre:
            filters?.genre && filters?.genre?.length > 0
              ? filters?.genre
              : undefined,
          q: filters?.q && filters?.q?.length > 0 ? filters?.q : undefined,
        }),
      }),
  });

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
    <div className="relative mt-6 w-4/6 m-auto">
      <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-background" />
      <Input
        ref={inputRef}
        value={localSearch}
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
