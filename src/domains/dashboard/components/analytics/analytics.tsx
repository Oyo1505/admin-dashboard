'use client';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import { Suspense } from 'react';
import useUserStore from 'store/user/user-store';
import TableUsersAnalyticsAdmin from '../table_users-analytics-admin/table_users-analytics-admin';
import TableUsersAnalyticsUser from '../table_users-analytics-user/table_users-analytics-user';

const Analytics = () => {
  const { user } = useUserStore((state) => state);
  const hasAdminPermission = checkPermissions(
    user,
    'can:viewAnalyticsAdmin',
    'dashboard'
  );
  const hasUserPermission = checkPermissions(
    user,
    'can:viewAnalyticsUser',
    'dashboard'
  );

  return (
    <div>
      {hasUserPermission && (
        <Suspense fallback={null}>
          <TableUsersAnalyticsUser />
        </Suspense>
      )}
      {hasAdminPermission && (
        <Suspense fallback={null}>
          <TableUsersAnalyticsAdmin />
        </Suspense>
      )}
    </div>
  );
};

export default Analytics;
