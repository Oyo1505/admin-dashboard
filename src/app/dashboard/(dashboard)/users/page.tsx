
import React from 'react'
import { redirect } from 'next/navigation';
import  Search  from '@/components/dashboard/components/search-user/search-user';
import UsersTable from '@/components/dashboard/components/user-table/users-table';
import { auth } from '@/lib/auth';
import { getUsersWithPageParam } from '@/components/dashboard/action';
import { getAuthorizedEmails } from '@/components/auth/action/action';
import FormAddEmailAuthrizedEmail from '@/components/auth/components/form-add-email-authorized/form-add-email-authorized';
import { EmailAuthrizedEmailRow } from '@/components/dashboard/components/email-user-authorized-row/email-user-authorized-row';
import Title from '@/components/ui/components/title/title';

const Page = async (
  props: {
    searchParams: Promise<{ q: string; offset: string }>;
  }
) => {
  const searchParams = await props.searchParams;
  const session = await auth()
  const search = searchParams.q ?? '';
  const offset = Number(searchParams.offset ?? 20);
  const { users, newOffset } = await getUsersWithPageParam(search, offset)
  const { mails } = await getAuthorizedEmails()

  if(!session?.user) return redirect('/')

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
          <EmailAuthrizedEmailRow key={item?.id} email={item?.email ?? ''} />
        ))}
      <FormAddEmailAuthrizedEmail />
      </div>
  </div>
  )
}

export default Page