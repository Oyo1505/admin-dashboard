'use client';

import { URL_DASHBOARD, URL_HOME, URL_MOVIES } from '@/shared/route';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const LINKS = [
  { href: URL_HOME, label: 'home' as const },
  { href: URL_MOVIES, label: 'movies' as const },
  { href: URL_DASHBOARD, label: 'dashboard' as const },
];

const MenuMobileItem = ({
  setIsActive,
}: {
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const t = useTranslations('Menu');
  const pathname = usePathname();

  return (
    <>
      {LINKS.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <li key={href} className="py-5 w-full text-center">
            <Link
              href={href}
              replace={href === URL_MOVIES}
              onClick={() => setIsActive(false)}
              className={clsx(
                'text-2xl font-medium tracking-wide transition-colors duration-200 relative inline-block',
                isActive
                  ? 'text-white after:absolute after:-bottom-1 after:left-0 after:w-full after:h-px after:bg-red-500'
                  : 'text-white/50 hover:text-white',
              )}
            >
              {t(label)}
            </Link>
          </li>
        );
      })}
    </>
  );
};

export default MenuMobileItem;
