'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/domains/ui/components/card/card';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import { useRecentActivity } from '../../hooks/useAdminStats';
import { useTranslations } from 'next-intl';
import { UserPlus, Film, Clock } from 'lucide-react';

const RecentActivityFeed = () => {
  const t = useTranslations('DashboardAnalytics');
  const { data, isLoading, error } = useRecentActivity();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentActivity')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{data?.newUsers ?? 0}</p>
                <p className="text-xs text-muted-foreground">{t('newUsers')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <Film className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{data?.newMovies ?? 0}</p>
                <p className="text-xs text-muted-foreground">{t('newMovies')}</p>
              </div>
            </div>
          </div>

          {/* Recent Users */}
          {data?.recentUsers && data.recentUsers.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">{t('recentUsersAdded')}</h4>
              <div className="space-y-2">
                {data.recentUsers.map((user: { id: string; name: string; createdAt: string | Date }) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                  >
                    <UserPlus className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{user.name}</span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Movies */}
          {data?.recentMovies && data.recentMovies.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">{t('recentMoviesAdded')}</h4>
              <div className="space-y-2">
                {data.recentMovies.map((movie: { id: string; title: string; createdAt: string | Date }) => (
                  <div
                    key={movie.id}
                    className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                  >
                    <Film className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{movie.title}</span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(movie.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!data?.recentUsers || data.recentUsers.length === 0) &&
            (!data?.recentMovies || data.recentMovies.length === 0) && (
              <p className="text-sm text-muted-foreground">{t('noRecentActivity')}</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
