'use client';
import { SearchIcon } from '@/domains/ui/components/icons/icons';
import { Input } from '@/domains/ui/components/input/input';
import { URL_MOVIES } from '@/shared/route';
import { useFiltersMovieStore } from '@/store/movie/movie-store';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import qs from 'qs';
import React, { useRef } from 'react';

const SearchMovie = ({ search }: { search: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('Filters');
  const router = useRouter();
  const { filters, setFiltersData } = useFiltersMovieStore();
  const [localSearch, setLocalSearch] = React.useState(search || '');

  const onPressEnter = () => {
    const queryString = qs.stringify({
      subtitles: filters?.subtitles || undefined,
      language: filters?.language || undefined,
      decade: filters?.decade || undefined,
      genre: filters?.genre || undefined,
      q: localSearch || undefined,
    });
    router.replace(`${URL_MOVIES}?${queryString}`);
  };

  return (
    <div className="relative mt-6 w-full md:w-4/6 m-auto">
      <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-background" />
      <Input
        ref={inputRef}
        value={localSearch}
        aria-label="search-input"
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
