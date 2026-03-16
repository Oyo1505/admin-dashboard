'use client';
import { signOut } from '@/lib/auth-client';
import { URL_BASE } from '@/shared/route';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '../button/button';

const ButtonLogout = () => {
  const t = useTranslations('Menu');
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push(URL_BASE);
  };

  return (
    <Button
      className="transition-colors hover:cursor-pointer duration-300"
      onClick={handleLogout}
    >
      {t('logout')}
    </Button>
  );
};
export default ButtonLogout;
