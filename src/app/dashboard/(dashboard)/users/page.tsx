
import React from 'react'
import { redirect } from 'next/navigation';
import  Search  from '@/app/search';
import UsersTable from '@/app/users-table';
import { auth } from '@/lib/auth';
import { getUsersWithPageParam } from '@/components/dashboard/action';
import { getAuthorizedEmails } from '@/components/auth/action/action';
import FormAddEmailAuthrizedEmail from '@/components/auth/components/form-add-email-authorized/form-add-email-authorized';

const Page = async ({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) => {
  const session = await auth()
  const search = searchParams.q ?? '';
  const offset = Number(searchParams.offset ?? 20);
  const { users, newOffset } = await getUsersWithPageParam(search, offset)
  const { userauthorizedEmails } = await getAuthorizedEmails()
  
  if(!session?.user) return redirect('/')
  return (
  <div className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6'>    
      <div className="flex items-center mb-8">
    <h1 className="font-semibold text-lg md:text-2xl">Users</h1>
  </div>
  <div className="w-full mb-4">
    <Search value={searchParams.q} />
  </div>
    <UsersTable users={users} offset={newOffset}  /> 
      {userauthorizedEmails?.map(item => <div key={item?.id}>{item.email}</div>)}
    <FormAddEmailAuthrizedEmail />
    
  </div>
  )
}

export default Page