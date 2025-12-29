'use client';

import { useSession } from '@/lib/auth-client';
import { URL_DASHBOARD, URL_HOME, URL_MOVIES } from '@/shared/route';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { Activity } from 'react';

const MenuMobileItem = ({
  setIsActive,
  isActive,
}: {
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  isActive: boolean;
}) => {
  const { data: session } = useSession();
  const t = useTranslations('Menu');

  return (
    <Activity mode={session ? 'visible' : 'hidden'}>
      <Link
        className="hover:text-red-600"
        href={URL_HOME}
        onClick={() => setIsActive(!isActive)}
      >
        {t('home')}
      </Link>
      <Link
        className="hover:text-red-600"
        href={URL_MOVIES}
        replace={true}
        onClick={() => setIsActive(!isActive)}
      >
        {t('movies')}
      </Link>
      <Link
        onClick={() => setIsActive(!isActive)}
        className="hover:text-red-600"
        href={URL_DASHBOARD}
      >
        {t('dashboard')}
      </Link>
    </Activity>
  );
};

export default MenuMobileItem;
