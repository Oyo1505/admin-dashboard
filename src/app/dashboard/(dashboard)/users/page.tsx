
import React from 'react'
import  Search  from '@/domains/dashboard/components/search-user/search-user';
import UsersTable from '@/domains/dashboard/components/user-table/users-table';
import { auth } from '@/lib/auth';
import { getUsersWithPageParam } from '@/domains/dashboard/action';
import { getAuthorizedEmails, getUserConnected } from '@/domains/auth/action/action';
import FormAddEmailAuthrizedEmail from '@/domains/auth/components/form-add-email-authorized/form-add-email-authorized';
import { EmailAuthrizedEmailRow } from '@/domains/dashboard/components/email-user-authorized-row/email-user-authorized-row';
import Title from '@/domains/ui/components/title/title';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';

const Page = async (
  props: {
    searchParams: Promise<{ q: string; offset: string }>;
  }
) => {
  const searchParams = await props.searchParams;
  const session = await auth()
  const userEmail = session?.user?.email ?? ''
  const userConnected = userEmail ? await getUserConnected(userEmail) : null
  const search = searchParams.q ?? '';
  const offset = Number(searchParams.offset ?? 20);
  const { users, newOffset } = await getUsersWithPageParam(search, offset)
  const { mails } = await getAuthorizedEmails()
  if(!userConnected?.user) return
  const hasPermission = checkPermissions(userConnected?.user, "can:delete", "user")
  if(!hasPermission) return <div className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6'>Vous n&lsquo;avez pas les permissions pour accéder à cette page</div>
 
  return (
  <div className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6'>    
      <div className="flex items-center mb-8">
    <h1 className="font-semibold text-lg md:text-2xl">Users</h1>
  </div>
  <div className="w-full mb-4">
    <Search value={searchParams.q} />
  </div>
    <UsersTable users={users}  offset={newOffset} />
    <div>
      <Title type='h3' translationText='emailAuthorized' translationTheme='Dashboard' className='text-3xlfont-semibold mb-6' />
      {mails?.map((item) => (
          <EmailAuthrizedEmailRow hasPermission={hasPermission} key={item?.id} email={item?.email ?? ''} />
        ))}
      <FormAddEmailAuthrizedEmail hasPermission={hasPermission ?? false}/>
      </div>
  </div>
  )
}

export default Page