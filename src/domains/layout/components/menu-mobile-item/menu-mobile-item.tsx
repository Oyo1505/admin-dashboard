'use client';

import { URL_DASHBOARD, URL_HOME, URL_MOVIES } from '@/shared/route';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

const MenuMobileItem = ({
  setIsActive,
}: {
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const t = useTranslations('Menu');

  return (
    <>
      <Link
        className="hover:text-red-600"
        href={URL_HOME}
        onClick={() => setIsActive(false)}
      >
        {t('home')}
      </Link>
      <Link
        className="hover:text-red-600"
        href={URL_MOVIES}
        replace={true}
        onClick={() => setIsActive(false)}
      >
        {t('movies')}
      </Link>
      <Link
        onClick={() => setIsActive(false)}
        className="hover:text-red-600"
        href={URL_DASHBOARD}
      >
        {t('dashboard')}
      </Link>
    </>
  );
};

export default MenuMobileItem;
