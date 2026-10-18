'use client';
import { useSession } from '@/lib/auth-client';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import AdminStatsCards from '../admin-stats-cards/admin-stats-cards';
import RecentActivityFeed from '../recent-activity-feed/recent-activity-feed';
import TopMoviesTable from '../top-movies-table/top-movies-table';
import TopUsersTable from '../top-users-table/top-users-table';
import UserFavoritesList from '../user-favorites-list/user-favorites-list';
import UserStatsCards from '../user-stats-cards/user-stats-cards';

const Analytics = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const hasAdminPermission = checkPermissions(
    { role: user?.role as 'ADMIN' | 'USER' | undefined },
    'can:viewAnalyticsAdmin',
    'dashboard'
  );
  const hasUserPermission = checkPermissions(
    { role: user?.role as 'ADMIN' | 'USER' | undefined },
    'can:viewAnalyticsUser',
    'dashboard'
  );

  return (
    <div className="space-y-6">
      {/* User Analytics Section */}
      {hasUserPermission ? (
        <div className="space-y-6">
          {/* User Stats Cards */}
          {user?.id && <UserStatsCards userId={user.id} />}

          {/* User Favorites List */}
          {user?.id && <UserFavoritesList userId={user.id} />}
        </div>
      ) : null}

      {/* Admin Analytics Section */}
      {hasAdminPermission ? (
        <div className="space-y-6">
          {/* Admin Stats Cards */}
          <AdminStatsCards />

          {/* Top Movies and Users Tables */}
          <div className="grid gap-6 md:grid-cols-2">
            <TopMoviesTable />
            <TopUsersTable />
          </div>

          {/* Recent Activity Feed */}
          <RecentActivityFeed />
        </div>
      ) : null}
    </div>
  );
};

export default Analytics;
