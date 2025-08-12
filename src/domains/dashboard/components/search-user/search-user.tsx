'use client';

import { SearchIcon, Spinner } from '@/domains/ui/components/icons/icons';
import { Input } from '@/domains/ui/components/input/input';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

const Search = (props: { value?: string }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(props.value);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (value === undefined) {
      return;
    } else if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }

    startTransition(() => {
      // All navigations are transitions automatically
      // But wrapping this allow us to observe the pending state
      router.replace(`${URL_DASHBOARD_ROUTE.users}?${params.toString()}`);
    });
  }, [router, value]);

  return (
    <div className="relative">
      <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
      <Input
        ref={inputRef}
        value={value ?? ''}
        onInput={(e) => {
          setValue(e.currentTarget.value);
        }}
        spellCheck={false}
        className="w-full bg-white text-background shadow-none appearance-none pl-8"
        placeholder="Search users..."
      />
      {isPending && <Spinner />}
    </div>
  );
};
export default Search;
