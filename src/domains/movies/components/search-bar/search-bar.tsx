'use client';
import { SearchIcon, Spinner } from '@/domains/ui/components/icons/icons';

import { Input } from '@/domains/ui/components/input/input';
import { useTranslations } from 'next-intl';
import { useRef, useState, useTransition } from 'react';

const SearchBar = (props: { value?: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value] = useState(props.value);
  const [isPending] = useTransition();
  const t = useTranslations('Search');
  return (
    <div className="relative">
      <label htmlFor="search-users-input" className="sr-only">
        {t('searchLabel')}
      </label>
      <SearchIcon
        className="absolute left-2.5 top-3 h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
      <Input
        id="search-users-input"
        ref={inputRef}
        value={value ?? ''}
        onInput={() => {
          // setValue(e.currentTarget.value);
        }}
        spellCheck={false}
        className="w-full bg-white shadow-none appearance-none pl-8"
        placeholder="Search users..."
        aria-label="Rechercher des utilisateurs"
      />
      {isPending && (
        <div
          role="status"
          aria-live="polite"
          className="absolute right-2.5 top-3"
        >
          <Spinner />
          <span className="sr-only">{t('loadingLabel')}</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
