'use client';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import useUserStore from '@/store/user/user-store';
import { Activity } from 'react';
import AdminStatsCards from '../admin-stats-cards/admin-stats-cards';
import AnalyticsVisits from '../analytics-visits/analytics-visits';
import RecentActivityFeed from '../recent-activity-feed/recent-activity-feed';
import TopMoviesTable from '../top-movies-table/top-movies-table';
import TopUsersTable from '../top-users-table/top-users-table';
import UserFavoritesList from '../user-favorites-list/user-favorites-list';
import UserStatsCards from '../user-stats-cards/user-stats-cards';

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
    <div className="space-y-6">
      {/* User Analytics Section */}
      <Activity mode={hasUserPermission ? 'visible' : 'hidden'}>
        <div className="space-y-6">
          {/* User Stats Cards */}
          {user?.id && <UserStatsCards userId={user.id} />}

          {/* User Favorites List */}
          {user?.id && <UserFavoritesList userId={user.id} />}
        </div>
      </Activity>

      {/* Admin Analytics Section */}
      <Activity mode={hasAdminPermission ? 'visible' : 'hidden'}>
        <div className="space-y-6">
          {/* Admin Stats Cards */}
          <AdminStatsCards />

          {/* Application Visits */}
          <AnalyticsVisits />

          {/* Top Movies and Users Tables */}
          <div className="grid gap-6 md:grid-cols-2">
            <TopMoviesTable />
            <TopUsersTable />
          </div>

          {/* Recent Activity Feed */}
          <RecentActivityFeed />
        </div>
      </Activity>
    </div>
  );
};

export default Analytics;
