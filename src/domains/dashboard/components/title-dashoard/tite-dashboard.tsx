'use client';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import { useTranslations } from 'next-intl';
import useUserStore from 'store/user/user-store';
import TableUsersAnalytics from '../table_users-analytics/table_users-analytics';
import { Suspense } from 'react';
import LoadingSpinner from '@/domains/shared/loading-spinner/loading-spinner';

const TitleDashboard = () => {
  const t = useTranslations('Dashboard');
  const { user } = useUserStore((state) => state);
  const hasPermission = checkPermissions(
    user,
    'can:viewAnalytics',
    'dashboard'
  );

  return (
    <div>
      <h1 className="text-2xl text-primary">
        {t('welcome')}, {user?.name} 👋
      </h1>
      {hasPermission && (
        <Suspense fallback={null}>
          <TableUsersAnalytics />
        </Suspense>
      )}
    </div>
  );
};

export default TitleDashboard;
