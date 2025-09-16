'use client';
import { URL_MOVIES } from '@/shared/route';
import { useFiltersMovieStore } from '@/store/movie/movie-store';
import { useRouter } from 'next/navigation';
import qs from 'qs';
import { startTransition, useCallback } from 'react';

const useMovieFilters = () => {
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

  const onClickClearSearch = () => {
    router.replace(`${URL_MOVIES}`);
  };

  return {
    onChangeGenre,
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
