'use client';
import useUserStore from '@/store/user/user-store';
import { useTranslations } from 'next-intl';
const TitleDashboard = () => {
  const t = useTranslations('Dashboard');
  const { user } = useUserStore((state) => state);

  return (
    <div>
      <h1 className="text-2xl text-primary">
        {t('welcome')}, {user?.name} 👋
      </h1>
    </div>
  );
};

export default TitleDashboard;
