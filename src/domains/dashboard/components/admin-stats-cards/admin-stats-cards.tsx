'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/domains/ui/components/card/card';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import { useAdminStats } from '../../hooks/useAdminStats';
import { useTranslations } from 'next-intl';
import { Users, Film, Folder, Activity, CheckCircle, XCircle } from 'lucide-react';

const AdminStatsCards = () => {
  const t = useTranslations('DashboardAnalytics');
  const { data, isLoading, error } = useAdminStats();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-red-500">
        {t('errorLoading')}
      </div>
    );
  }

  const stats = data?.aggregatedStats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* Total Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('totalUsers')}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
        </CardContent>
      </Card>

      {/* Total Movies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('totalMovies')}
          </CardTitle>
          <Film className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalMovies ?? 0}</div>
        </CardContent>
      </Card>

      {/* Total Genres */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('totalGenres')}
          </CardTitle>
          <Folder className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalGenres ?? 0}</div>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('activeUsers')}
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activeUsers ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            {t('lastWeek')}
          </p>
        </CardContent>
      </Card>

      {/* Published Movies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('publishedMovies')}
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.publishedMovies ?? 0}</div>
        </CardContent>
      </Card>

      {/* Unpublished Movies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('unpublishedMovies')}
          </CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.unpublishedMovies ?? 0}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsCards;
