'use client';
import { getAllAnalyticsUser } from '@/domains/auth/actions/action.users';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/domains/ui/components/table/table';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

const TableUsersAnalyticsAdmin = () => {
  const t = useTranslations('DashboardAnalytics');
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAllAnalyticsUser,
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
            <TableHead>{t('visits')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>
                {user.analytics?.[0]?.lastLogin?.toLocaleString()}
              </TableCell>
              <TableCell>{user.analytics?.[0]?.lastMovieWatched}</TableCell>
              <TableCell>{user.analytics?.[0]?.visits || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default TableUsersAnalyticsAdmin;
