'use client';
import useUserStore from '@/store/user/user-store';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import { Button } from '../button/button';

const ButtonLogout = memo(() => {
  const { logout } = useUserStore((state) => state);
  const t = useTranslations('Menu');

  return (
    <Button
      className="transition-all hover:cursor-pointer duration-300"
      onClick={logout}
    >
      {t('logout')}
    </Button>
  );
});
ButtonLogout.displayName = 'ButtonLogout';
export default ButtonLogout;
