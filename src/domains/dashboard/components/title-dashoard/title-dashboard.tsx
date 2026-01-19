'use client';
import useUserStore from '@/store/user/user-store';
import { useTranslations } from 'next-intl';
import ButtonAddMovie from '../button-add-movie/button-add-movie';
const TitleDashboard = () => {
  const t = useTranslations('Dashboard');
  const { user } = useUserStore((state) => state);

  return (
    <div>
      <h1 className="text-2xl text-primary">
        {t('welcome')}, {user?.name} 👋
      </h1>
      <ButtonAddMovie />
    </div>
  );
};

export default TitleDashboard;
