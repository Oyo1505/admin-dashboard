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
import { useQuery } from '@tanstack/react-query';

const TableUsersAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAllAnalytics,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Last Movie Watched</TableHead>
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

export default TableUsersAnalytics;
