'use client';
import { useTranslations } from 'next-intl';
import React, { memo } from 'react';
import { Input } from '../input/input';

const Toggle = memo(
  ({
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
        <Input
          type="checkbox"
          checked={publish}
          disabled={isFetching}
          value={publish ? 'true' : undefined}
          className="sr-only peer"
          onChange={toggle}
        />
        <div
          className={`relative w-11 h-6 bg-gray-200  peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer  peer-checked:after:translate-x-full ${publish === true ? 'peer-checked:rtl:after:-translate-x-full' : ''} peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600`}
        ></div>
        <span className="ms-3 text-sm text-background font-bold">
          {publish ? t('toggleUnpublished') : t('togglePublished')}
        </span>
      </label>
    );
  }
);
Toggle.displayName = 'Toggle';
export default Toggle;
