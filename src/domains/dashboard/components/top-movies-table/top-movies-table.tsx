'use client';

import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/domains/ui/components/card/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/domains/ui/components/table/table';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useTopMovies } from '../../hooks/useAdminStats';

const TopMoviesTable = () => {
  const t = useTranslations('DashboardAnalytics');
  const { data, isLoading, error } = useTopMovies();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{t('errorLoading')}</div>;
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
                <TableHead className="text-right">{t('watchCount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(
                (movie: {
                  id: string;
                  title: string;
                  image: string;
                  watchCount: number;
                }) => (
                  <TableRow key={movie.id}>
                    <TableCell>
                      <div className="relative h-12 w-8 overflow-hidden rounded">
                        <Image
                          src={movie.image}
                          alt={movie.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{movie.title}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>{movie.watchCount}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TopMoviesTable;
