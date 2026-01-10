'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/domains/ui/components/card/card';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import { useUserStats } from '../../hooks/useUserStats';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { IMovie } from '@/models/movie/movie';

interface UserFavoritesListProps {
  userId: string;
}

const UserFavoritesList = ({ userId }: UserFavoritesListProps) => {
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

  const recentFavorites = data?.recentFavorites as IMovie[] | undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentFavorites')}</CardTitle>
      </CardHeader>
      <CardContent>
        {!recentFavorites || recentFavorites.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noRecentFavorites')}</p>
        ) : (
          <div className="space-y-4">
            {recentFavorites.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded">
                  <Image
                    src={movie.image}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{movie.title}</p>
                  {movie.year && (
                    <p className="text-xs text-muted-foreground">{movie.year}</p>
                  )}
                  {movie.genresIds && movie.genresIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {movie.genresIds.slice(0, 2).map((genreItem) => (
                        <span
                          key={genreItem.genre.id}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                          {genreItem.genre.nameFR}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserFavoritesList;
