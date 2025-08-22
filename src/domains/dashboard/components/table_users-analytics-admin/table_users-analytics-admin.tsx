'use client';
import { getAllAnalytics } from '@/domains/auth/action/action';
import LoadingSpinner from '@/domains/shared/loading-spinner/loading-spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/domains/ui/components/table/table';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';

const TableUsersAnalyticsAdmin = () => {
  const t = useTranslations('DashboardAnalytics');
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAllAnalytics,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Analytics Admin</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('lastLogin')}</TableHead>
            <TableHead>{t('lastMovieWatched')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.users?.map((user) => (
            <>
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  {user.analytics[0]?.lastLogin.toLocaleString()}
                </TableCell>
                <TableCell>{user.analytics[0]?.lastMovieWatched}</TableCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default TableUsersAnalyticsAdmin;
