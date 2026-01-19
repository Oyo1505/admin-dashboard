'use client';
import useUserStore from '@/store/user/user-store';
import { useTranslations } from 'next-intl';
import { Activity } from 'react';
import ButtonAddMovie from '../button-add-movie/button-add-movie';
const TitleDashboard = () => {
  const t = useTranslations('Dashboard');
  const { user } = useUserStore((state) => state);

  return (
    <div>
      <h1 className="text-2xl text-primary">
        {t('welcome')}, {user?.name} 👋
      </h1>
      <Activity mode={user.role === 'ADMIN' ? 'visible' : 'hidden'}>
        <ButtonAddMovie />
      </Activity>
    </div>
  );
};

export default TitleDashboard;
