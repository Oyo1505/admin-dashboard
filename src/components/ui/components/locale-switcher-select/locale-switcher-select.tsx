'use client';
import { Locale } from '@/config';
import * as Select from '@radix-ui/react-select';
import clsx from 'clsx';

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

  function onChange(value: string) {
    const locale = value as Locale;

    startTransition(() => {
      setUserLocale(locale);
    });
  }

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
          <Select.Icon>
            Lang
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