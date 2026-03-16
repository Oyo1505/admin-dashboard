'use client';
import { useSession } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';
import { Activity } from 'react';
import ButtonAddMovie from '../button-add-movie/button-add-movie';

const TitleDashboard = () => {
  const t = useTranslations('Dashboard');
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-2xl text-primary">
        {t('welcome')}, {session?.user?.name} 👋
      </h1>
      <Activity mode={session?.user?.role === 'ADMIN' ? 'visible' : 'hidden'}>
        <ButtonAddMovie />
      </Activity>
    </div>
  );
};

export default TitleDashboard;
