'use client'
import { Button } from '@/components/ui/components/button/button';
import { SearchIcon, Spinner } from '@/components/ui/components/icons/icons';
import { Input } from '@/components/ui/components/input/input';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useTransition } from 'react'
import { useGetMoviesInfiniteScroll } from '../../hooks/use-get-all-image-infinite-scroll';

const SearchMovie = (props: { value?: string }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(props.value);
  const [isPending, startTransition] = useTransition();
  const { handleSearchChange } = useGetMoviesInfiniteScroll({pageParam: 6,search: value});

  const onClick = () => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    startTransition(() => {
      // All navigations are transitions automatically
      // But wrapping this allow us to observe the pending state
      router.replace(`/movies?${params.toString()}`);
    });
    handleSearchChange()
  };

  return (
    <div className="relative mt-6 w-4/6 m-auto">
      <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-background" />
      <Input
        ref={inputRef}
        value={value ?? ''}
        onInput={(e) => {
          setValue(e.currentTarget.value);
        }}
        spellCheck={false}
        className="w-full bg-white shadow-none text-background appearance-none pl-8"
        placeholder="Search Movies..."
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onClick();
          }
        }}
      />
      <Button className="absolute right-2 top-1 h-8 w-23 bg-background text-white" onClick={onClick}  >
        Search
      </Button>
      {isPending && <Spinner />}
    </div>
  );
}

export default SearchMovie