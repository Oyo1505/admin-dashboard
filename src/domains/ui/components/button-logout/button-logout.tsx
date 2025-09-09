'use client';
import useUserStore from '@/store/user/user-store';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import { Button } from '../button/button';

const ButtonLogout = memo(() => {
  const { logout } = useUserStore((state) => state);
  const t = useTranslations('Menu');

  const onClick = async () => {
    logout();
  };

  return (
    <Button
      className="transition-all hover:cursor-pointer duration-300"
      onClick={onClick}
    >
      {t('logout')}
    </Button>
  );
});
ButtonLogout.displayName = 'ButtonLogout';
export default ButtonLogout;
