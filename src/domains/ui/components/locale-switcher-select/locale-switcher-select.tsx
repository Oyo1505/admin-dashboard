'use client';
import { Locale } from '@/config';
import * as Select from '@radix-ui/react-select';
import clsx from 'clsx';
import { useLocale } from 'next-intl';

import { useTransition } from 'react';
import { setUserLocale } from 'utilities/services/locale';
import { LanguageLogo } from '../icons/icons';

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  label,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  function onChange(value: string) {
    const locale = value as Locale;

    startTransition(() => {
      setUserLocale(locale);
    });
  }

  const flags = [
    { lang: 'jp', flag: '🇯🇵' },
    { lang: 'en', flag: '🇬🇧' },
    { lang: 'fr', flag: '🇫🇷' },
  ];
  const flagFilter = flags.filter((flag) => flag.lang === locale)[0];

  return (
    <div>
      <Select.Root defaultValue={defaultValue} onValueChange={onChange}>
        <Select.Trigger
          aria-label={label}
          className={clsx(
            'rounded-sm p-2 w-16 transition-colors text-primary  hover:text-background hover:cursor-pointer',
            isPending && 'pointer-events-none '
          )}
        >
          <Select.Icon className="w-55 flex gap-2">
            <LanguageLogo />
            {flagFilter.flag}
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            align="end"
            className="min-w-[8rem] overflow-hidden rounded-sm mt-2 bg-white py-1 shadow-md z-50 lg:z-0"
            position="popper"
          >
            <Select.Viewport>
              {items.map((item) => (
                <Select.Item
                  key={item.value}
                  className="flex cursor-default items-center px-3 py-2 text-base data-highlighted:bg-slate-100"
                  value={item.value}
                >
                  <span className="text-slate-900">{item.label}</span>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
