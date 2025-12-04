'use client';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Input } from '../input/input';

const Toggle = ({
  toggle,
  publish,
  isFetching,
}: {
  toggle: React.ChangeEventHandler<HTMLInputElement>;
  publish: boolean | undefined;
  isFetching: boolean;
}) => {
  const t = useTranslations('Dashboard');

  return publish === undefined ? null : (
    <label className="inline-flex items-center cursor-pointer">
      <span className="sr-only">{t('togglePublished')}</span>
      <Input
        aria-label="toggle-published-movie"
        type="checkbox"
        checked={publish}
        disabled={isFetching}
        value={publish ? 'true' : undefined}
        className="sr-only peer w-14"
        onChange={toggle}
      />
      <div className="toggle-switch" />
    </label>
  );
};

export default Toggle;
