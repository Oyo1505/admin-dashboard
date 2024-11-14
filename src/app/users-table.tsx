'use client';
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table
} from '@/components/ui/components/table/table';
import { Button } from '@/components/ui/components/button/button';
import { useRouter } from 'next/navigation';
import { deleteUserById } from '../components/dashboard/action';
import { User } from '@/models/user/user';
import useUserStore from 'store/user/user-store';

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
      <form className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
          <TableRow className='border-b  border-background border-opacity-20'>
              <TableHead className="max-w-[150px] text-primary font-bold">Name</TableHead>
              <TableHead className="hidden md:table-cell text-primary font-bold">Email</TableHead>
              <TableHead className="hidden md:table-cell text-primary font-bold">Role</TableHead>
              <TableHead className="hidden md:table-cell text-primary font-bold">Action</TableHead>
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
}

function UserRow({ user }: { user: User }) {
  const userId = user.id;
  const { user:userConnected } = useUserStore(state => state);
  
  const deleteUser = async () => {
    userId && (await deleteUserById(userId))
  }

  return (
     
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
      <TableCell>{user.role ?? 'USER'}</TableCell>
      {userId !==  userConnected?.id && userConnected?.role === 'ADMIN' && 
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
      
      }

    </TableRow>
  );
}

export default UsersTable