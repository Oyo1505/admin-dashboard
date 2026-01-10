'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/domains/ui/components/card/card';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import { useUserStats } from '../../hooks/useUserStats';
import { useTranslations } from 'next-intl';
import { Heart, Film, TrendingUp } from 'lucide-react';

interface UserStatsCardsProps {
  userId: string;
}

const UserStatsCards = ({ userId }: UserStatsCardsProps) => {
  const t = useTranslations('DashboardAnalytics');
  const { data, isLoading, error } = useUserStats(userId);

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Favorites Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('totalFavorites')}
          </CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.totalFavorites ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            {t('favoritesDescription')}
          </p>
        </CardContent>
      </Card>

      {/* Favorite Genre Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('favoriteGenre')}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.favoriteGenre?.nameFR ?? t('noGenre')}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('favoriteGenreDescription')}
          </p>
        </CardContent>
      </Card>

      {/* Recent Favorites Count Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('recentFavorites')}
          </CardTitle>
          <Film className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.recentFavorites?.length ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('recentFavoritesDescription')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStatsCards;
