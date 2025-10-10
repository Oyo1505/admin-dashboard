'use client';
import { URL_MOVIES } from '@/shared/route';
import { useFiltersMovieStore } from '@/store/movie/movie-store';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import qs from 'qs';
import { startTransition, useCallback } from 'react';
import { fetchMovies } from '../actions/movies';

interface Props {
  offset?: number;
}

const useMovieFilters = ({ offset = 0 }: Props = {}) => {
  const router = useRouter();

  const { filters, setFiltersData, setHasBeenSearched, hasBeenSearched } =
    useFiltersMovieStore();

  function onChangeSubtitles(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === undefined) {
      return;
    }
    setFiltersData({ ...filters, subtitles: e.target.value });
  }

  function onChangeCountry(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === undefined) {
      return;
    }
    setFiltersData({ ...filters, language: e.target.value });
  }

  function onChangeDecade(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === undefined) {
      return;
    }
    setFiltersData({ ...filters, decade: Number(e.target.value) });
  }

  function onChangeGenre(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === undefined) {
      return;
    }
    setFiltersData({ ...filters, genre: e.target.value });
  }

  const onClick = useCallback(() => {
    startTransition(() => {
      router.replace(
        `${URL_MOVIES}?${qs.stringify({
          q: filters?.q && filters?.q?.length > 0 ? filters?.q : undefined,
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
        })}`
      );
    });
    setHasBeenSearched(true);
  }, [filters, router, setHasBeenSearched]);

  const buildQueryString = () => {
    return qs.stringify({
      subtitles:
        filters?.subtitles && filters?.subtitles?.length > 0
          ? filters?.subtitles
          : undefined,
      language:
        filters?.language && filters?.language?.length > 0
          ? filters?.language
          : undefined,
      decade:
        filters?.decade && filters?.decade > 0 ? filters?.decade : undefined,
      genre:
        filters?.genre && filters?.genre?.length > 0
          ? filters?.genre
          : undefined,
      q: filters?.q && filters?.q?.length > 0 ? filters?.q : undefined,
    });
  };

  const queryFilterSearch = useQuery({
    queryKey: ['moviesFilters', offset],
    enabled: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: () =>
      fetchMovies({
        pageParam: offset,
        search: buildQueryString(),
      }),
  });
  const onClickClearSearch = () => {
    router.replace(`${URL_MOVIES}`);
  };

  return {
    onChangeGenre,
    queryFilterSearch,
    onChangeDecade,
    onChangeCountry,
    onChangeSubtitles,
    filters,
    setFiltersData,
    setHasBeenSearched,
    hasBeenSearched,
    onClick,
    onClickClearSearch,
  };
};

export default useMovieFilters;
