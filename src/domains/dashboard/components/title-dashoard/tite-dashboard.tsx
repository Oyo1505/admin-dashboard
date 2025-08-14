'use client';
import { useTranslations } from 'next-intl';
import useUserStore from 'store/user/user-store';

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
