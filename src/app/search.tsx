'use client';

import { Input } from '@/components/ui/components/input/input';
import { SearchIcon, Spinner } from '@/components/ui/components/icons/icons';
import { useRouter } from 'next/navigation';
import { useTransition, useEffect, useRef, useState } from 'react';

 const  Search = (props: { value?: string }) => {
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
      router.replace(`/dashboard?${params.toString()}`);
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
        className="w-full bg-white shadow-none appearance-none pl-8"
        placeholder="Search users..."
      />
      {isPending && <Spinner />}
    </div>
  );
}
export default Search