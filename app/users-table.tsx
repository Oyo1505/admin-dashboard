'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { deleteUserById } from './dashboard/action';
import { User } from '@/models/user/user';


export function UsersTable({
  users,
  offset,
  sessionUser
}: {
  users?: any[];
  offset?: number | null;
  sessionUser: any
}) {
  const router = useRouter();

  function onClick() {
    router.replace(`/?offset=${offset}`);
  }

  return (
    <>
      <form className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[150px]">Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <UserRow key={user.id} user={user} sessionUser={sessionUser} />
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
}

function UserRow({ user, sessionUser }: { user: User, sessionUser:User }) {
  const userId = user.id;
  const deleteUser = async () => {
    userId && await deleteUserById(userId)
  }

  return (
     
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
      <TableCell>{user.role}</TableCell>
      {userId !==  sessionUser?.id && sessionUser?.role === 'ADMIN' && 
            <TableCell>
            <Button
              className="w-full"
              size="sm"
              variant="outline"
              formAction={deleteUser}
            >
              Delete
            </Button>
          </TableCell>
      
      }

    </TableRow>
  );
}
