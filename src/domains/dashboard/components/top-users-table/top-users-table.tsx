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
import { useTopUsers } from '../../hooks/useAdminStats';
import { useTranslations } from 'next-intl';
import { Activity } from 'lucide-react';

const TopUsersTable = () => {
  const t = useTranslations('DashboardAnalytics');
  const { data, isLoading, error } = useTopUsers();

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
        <CardTitle>{t('topUsers')}</CardTitle>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noTopUsers')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead className="text-right">{t('visits')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((user: { id: string; name: string; email: string; visits: number }) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>{user.visits}</span>
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

export default TopUsersTable;
