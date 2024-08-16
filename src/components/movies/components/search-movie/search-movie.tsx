'use client'
import { SearchIcon, Spinner } from '@/components/ui/components/icons/icons';
import { Input } from '@/components/ui/components/input/input';
import { useRouter } from 'next/navigation';
import React, { useRef, useTransition } from 'react'
import { URL_MOVIES } from '@/shared/route';
import { useFiltersMovieStore } from 'store/movie/movie-store';
import qs from 'qs';
import { useTranslations } from 'next-intl';

const SearchMovie = ( { search }: { search: string }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('Filters')
  const {filters, setFiltersData} = useFiltersMovieStore();
  const [isPending, startTransition] = useTransition();

  function onChangeSearch(e: any) {
    const queryValue = e.target.value;
  
    setFiltersData({...filters, q: e.target.value});
    startTransition(() => {

      const params = {
        q: queryValue && queryValue.length > 0 ? queryValue : undefined,
        subtitles: filters?.subtitles && filters?.subtitles.length > 0 ? filters?.subtitles : undefined,
        language: filters?.language && filters?.language.length > 0 ? filters?.language : undefined,
      };
      const queryString = qs.stringify(params, { skipNulls: true });

      router.replace(`${URL_MOVIES}?${queryString}`);
    });
  }

  return (
    <div className="relative mt-6 w-4/6 m-auto">
      <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-background" />
      <Input
        ref={inputRef}
        value={filters?.q ?? undefined}
        onInput={(e) => onChangeSearch(e)}
        defaultValue={search ?? ''}
        spellCheck={false}
        className="w-full bg-white shadow-none text-background appearance-none pl-8"
        placeholder={t('placeholderSearch')}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onChangeSearch(event)
          }
        }}
      />
      {isPending && <Spinner />}
    
    </div>
  );
}

export default SearchMovie