'use client';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import useUserStore from '@/store/user/user-store';
import { Activity } from 'react';
import AnalyticsVisits from '../analytics-visits/analytics-visits';
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
      <Activity mode={hasUserPermission ? 'visible' : 'hidden'}>
        <TableUsersAnalyticsUser />
      </Activity>
      <Activity mode={hasAdminPermission ? 'visible' : 'hidden'}>
        <TableUsersAnalyticsAdmin />
        <AnalyticsVisits />
      </Activity>
    </div>
  );
};

export default Analytics;
