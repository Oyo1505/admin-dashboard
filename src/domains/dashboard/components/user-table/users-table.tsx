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
import { User } from '@/models/user/user';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import useUserStore from '@/store/user/user-store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useOptimistic } from 'react';
import { deleteUserById } from '../../action';

const UsersTable = ({
  users,
  offset,
}: {
  users: User[];
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
      {offset !== null && (
        <Button
          className="mt-4 w-40"
          variant="secondary"
          onClick={() => onClick()}
        >
          Next Page
        </Button>
      )}
    </>
  );
};

function UserRow({ user }: { user: User }) {
  const userId = user.id;
  const { user: userConnected } = useUserStore((state) => state);
  const [optimitiscUser, setOptimitiscUser] = useOptimistic(userId);
  const session = useSession();
  const deleteUser = async () => {
    setOptimitiscUser('');
    try {
      if (userId) {
        await deleteUserById({
          id: userId,
          user: userConnected,
          token: session?.data,
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
      {optimitiscUser !== userConnected?.id && hasPermission && (
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
      )}
    </TableRow>
  );
}

export default UsersTable;
