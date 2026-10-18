'use client';
import { Button } from '@/domains/ui/components/button/button';
import ConfirmDialog from '@/domains/ui/components/confirm-dialog/confirm-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/domains/ui/components/table/table';
import { useSession } from '@/lib/auth-client';
import { logError } from '@/lib/errors';
import { IUser } from '@/models/user/user';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { startTransition, useOptimistic } from 'react';
import { deleteUserById } from '../../actions/user';

const HEAD_CLASS = 'text-primary font-bold';

const UsersTable = ({
  users,
  offset,
}: {
  users: IUser[];
  offset?: number | null;
}) => {
  const router = useRouter();
  const t = useTranslations('Dashboard');

  return (
    <>
      <div className="border shadow-xs rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-b  border-background border-opacity-20">
              <TableHead className={`max-w-[150px] ${HEAD_CLASS}`}>
                {t('usersName')}
              </TableHead>
              <TableHead className={`hidden md:table-cell ${HEAD_CLASS}`}>
                {t('usersEmail')}
              </TableHead>
              <TableHead className={`hidden md:table-cell ${HEAD_CLASS}`}>
                {t('usersRole')}
              </TableHead>
              <TableHead className={`hidden md:table-cell ${HEAD_CLASS}`}>
                {t('actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </TableBody>
        </Table>
      </div>
      {offset ? (
        <Button
          type="button"
          className="mt-4 w-40"
          variant="secondary"
          onClick={() => router.replace(`/dashboard/users?offset=${offset}`)}
        >
          {t('nextPage')}
        </Button>
      ) : null}
    </>
  );
};

function UserRow({ user }: { user: IUser }) {
  const userId = user.id;
  const t = useTranslations('Dashboard');
  const { data: session } = useSession();
  const userConnected = {
    id: session?.user?.id,
    role: session?.user?.role as 'ADMIN' | 'USER' | undefined,
  };
  const [optimisticUser, setOptimisticUser] = useOptimistic(userId);

  // useOptimistic updates must run inside a transition
  const deleteUser = () =>
    startTransition(async () => {
      setOptimisticUser('');
      try {
        if (userId) {
          await deleteUserById({ id: userId, user: userConnected });
        }
      } catch (err) {
        logError(err, 'UserRow');
      }
    });

  const hasPermission = checkPermissions(userConnected, 'can:delete', 'user');
  const userName = user.name ?? user.email ?? userId ?? '';

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
      <TableCell>{user.role ?? 'USER'}</TableCell>
      {optimisticUser !== userConnected?.id && hasPermission && (
        <TableCell>
          <ConfirmDialog
            triggerLabel={t('deleteButton')}
            triggerAriaLabel={`${t('deleteButton')} ${userName}`}
            title={t('confirmDeleteUserTitle', { name: userName })}
            description={t('confirmDeleteDescription')}
            confirmLabel={t('deleteButton')}
            cancelLabel={t('cancel')}
            onConfirm={deleteUser}
          />
        </TableCell>
      )}
    </TableRow>
  );
}

export default UsersTable;
