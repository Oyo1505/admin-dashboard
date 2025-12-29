'use client';
import { Button } from '@/domains/ui/components/button/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/domains/ui/components/table/table';
import { logError } from '@/lib/errors';
import { IUser } from '@/models/user/user';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import useUserStore from '@/store/user/user-store';
import { useRouter } from 'next/navigation';
import { Activity, useOptimistic } from 'react';
import { deleteUserById } from '../../actions/user';

const UsersTable = ({
  users,
  offset,
}: {
  users: IUser[];
  offset?: number | null;
}) => {
  const router = useRouter();

  function onClick() {
    router.replace(`/dashboard/users?offset=${offset}`);
  }
  return (
    <>
      <form className="border shadow-xs rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-b  border-background border-opacity-20">
              <TableHead className="max-w-[150px] text-primary font-bold">
                Name
              </TableHead>
              <TableHead className="hidden md:table-cell text-primary font-bold">
                Email
              </TableHead>
              <TableHead className="hidden md:table-cell text-primary font-bold">
                Role
              </TableHead>
              <TableHead className="hidden md:table-cell text-primary font-bold">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </TableBody>
        </Table>
      </form>
      <Activity mode={offset ? 'visible' : 'hidden'}>
        <Button
          className="mt-4 w-40"
          variant="secondary"
          onClick={() => onClick()}
        >
          Next Page
        </Button>
      </Activity>
    </>
  );
};

function UserRow({ user }: { user: IUser }) {
  const userId = user.id;
  const { user: userConnected } = useUserStore((state) => state);
  const [optimitiscUser, setOptimitiscUser] = useOptimistic(userId);
  const deleteUser = async () => {
    setOptimitiscUser('');
    try {
      if (userId) {
        await deleteUserById({
          id: userId,
          user: userConnected,
        });
      }
    } catch (err) {
      logError(err, 'UserRow');
      throw new Error('User not deleted');
    }
  };
  const hasPermission = checkPermissions(userConnected, 'can:delete', 'user');
  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
      <TableCell>{user.role ?? 'USER'}</TableCell>
      <Activity
        mode={
          optimitiscUser !== userConnected?.id && hasPermission
            ? 'visible'
            : 'hidden'
        }
      >
        <TableCell>
          <Button
            className="w-full font-bold"
            size="sm"
            variant="destructive"
            formAction={deleteUser}
          >
            Delete
          </Button>
        </TableCell>
      </Activity>
    </TableRow>
  );
}

export default UsersTable;
