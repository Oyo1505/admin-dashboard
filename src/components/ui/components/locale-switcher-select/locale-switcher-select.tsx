'use client';
import { Locale } from '@/config';
import * as Select from '@radix-ui/react-select';
import clsx from 'clsx';
import { useLocale } from 'next-intl';

import {useTransition} from 'react';
import { setUserLocale } from 'utilities/services/locale';


type Props = {
  defaultValue: string;
  items: Array<{value: string; label: string}>;
  label: string;
};

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  label
}: Props) {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  function onChange(value: string) {
    const locale = value as Locale;

    startTransition(() => {
      setUserLocale(locale);
    });
  }

  const flags = [{lang:"jp", flag : '🇯🇵' }, {lang:"en", flag : '🇬🇧' }, {lang:"fr", flag : '🇫🇷' }]
  const flagFilter = flags.filter(flag => flag.lang === locale )[0]
 
  return (
    <div>
      <Select.Root defaultValue={defaultValue} onValueChange={onChange}>
        <Select.Trigger
          aria-label={label}
          className={clsx(
            'rounded-sm p-2 transition-colors hover:bg-slate-200',
            isPending && 'pointer-events-none opacity-60'
          )}
        >
          <Select.Icon className='w-55 flex gap-2'>
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m13 19 3.5-9 3.5 9m-6.125-2h5.25M3 7h7m0 0h2m-2 0c0 1.63-.793 3.926-2.239 5.655M7.5 6.818V5m.261 7.655C6.79 13.82 5.521 14.725 4 15m3.761-2.345L5 10m2.761 2.655L10.2 15"/>
          </svg>
            {flagFilter.flag}
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            align="end"
            className="min-w-[8rem] overflow-hidden rounded-sm bg-white py-1 shadow-md"
            position="popper"
          >
            <Select.Viewport>
              {items.map((item) => (
                <Select.Item
                  key={item.value}
                  className="flex cursor-default items-center px-3 py-2 text-base data-[highlighted]:bg-slate-100"
                  value={item.value}
                >
                  <span className="text-slate-900">{item.label}</span>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.Arrow className="fill-white text-white" />
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}