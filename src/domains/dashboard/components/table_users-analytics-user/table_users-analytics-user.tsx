'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/domains/ui/components/table/table';
import { useTranslations } from 'next-intl';
import useUserStore from 'store/user/user-store';

const TableUsersAnalyticsUser = () => {
  const { user } = useUserStore((state) => state);
  const t = useTranslations('DashboardAnalytics');
  return (
    <>
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('lastLogin')}</TableHead>
            <TableHead>{t('lastMovieWatched')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {user?.analytics?.map((analytic) => (
            <>
              <TableRow key={user.id}>
                <TableCell>{analytic.lastLogin.toLocaleString()}</TableCell>
                <TableCell>{analytic.lastMovieWatched}</TableCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default TableUsersAnalyticsUser;
