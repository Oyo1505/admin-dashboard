import FormAddEmailAuthrizedEmail from '@/domains/auth/components/form-add-email-authorized/form-add-email-authorized';
import { getUsersWithPageParam } from '@/domains/dashboard/actions/user';
import Search from '@/domains/dashboard/components/search-user/search-user';
import { UserTableAuthorized } from '@/domains/dashboard/components/users-table-authrized/user-table-authrized';
import Title from '@/domains/ui/components/title/title';
import { getServerSession } from '@/lib/auth';
import { UserData } from '@/lib/data/users';
import { IUser } from '@/models/user/user';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import dynamic from 'next/dynamic';

const UsersTable = dynamic(
  () => import('@/domains/dashboard/components/user-table/users-table')
);

const Page = async (props: {
  searchParams: Promise<{ q: string; offset: string }>;
}) => {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = Number(searchParams.offset ?? 20);

  // Parallel fetch: session and paginated users are independent
  const [session, paginatedUsers] = await Promise.all([
    getServerSession(),
    getUsersWithPageParam(search, offset),
  ]);
  const { users, newOffset } = paginatedUsers;

  // User profile depends on session email, so must be sequential
  const userEmail = session?.user?.email ?? '';
  const userConnected = userEmail
    ? await UserData.getUserConnected(userEmail)
    : null;
  const user = userConnected?.user as IUser;
  if (!user) return;
  const hasPermission = checkPermissions(user, 'can:delete', 'user');
  if (!hasPermission)
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        Vous n&lsquo;avez pas les permissions pour accéder à cette page
      </div>
    );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center mb-8">
        <h1 className="font-semibold text-lg md:text-2xl">Users</h1>
      </div>
      <div className="w-full mb-4">
        <Search value={searchParams.q} />
      </div>
      <UsersTable users={users ?? []} offset={newOffset} />
      <div>
        <Title
          type="h3"
          translationText="addEmailAuthorized"
          translationTheme="Dashboard"
          className="text-3x lfont-semibold mb-6"
        />
        <FormAddEmailAuthrizedEmail hasPermission={hasPermission ?? false} />
        <Title
          type="h3"
          translationText="emailAuthorized"
          translationTheme="Dashboard"
          className="text-xl font-semibold mb-6"
        />
        <UserTableAuthorized hasPermission={hasPermission} />
      </div>
    </div>
  );
};

export default Page;
