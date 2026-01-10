'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/domains/ui/components/card/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/domains/ui/components/table/table';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import { useTopMovies } from '../../hooks/useAdminStats';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Heart } from 'lucide-react';

const TopMoviesTable = () => {
  const t = useTranslations('DashboardAnalytics');
  const { data, isLoading, error } = useTopMovies();

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
        <CardTitle>{t('topMovies')}</CardTitle>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noTopMovies')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>{t('movie')}</TableHead>
                <TableHead className="text-right">{t('favorites')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((movie: { id: string; title: string; image: string; favoritesCount: number }) => (
                <TableRow key={movie.id}>
                  <TableCell>
                    <div className="relative h-12 w-8 overflow-hidden rounded">
                      <Image
                        src={movie.image}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{movie.title}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      <span>{movie.favoritesCount}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TopMoviesTable;
