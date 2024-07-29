import { auth } from '@/lib/auth';
import { getUsers } from '@/lib/db';
import { Search } from 'app/search'
import { UsersTable } from 'app/users-table'
import { redirect } from 'next/navigation';
import React, { use } from 'react'
import {getUsersWithPageParam} from '../action';

const Page = async ({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) => {
  const session = await auth()

  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 20 as number;
  const { users, newOffset } = await getUsersWithPageParam(search, offset)
  if(!session?.user) return redirect('/')
  return (
    <div>    
      <div className="flex items-center mb-8">
    <h1 className="font-semibold text-lg md:text-2xl">Users</h1>
  </div>
  <div className="w-full mb-4">
    <Search value={searchParams.q} />
  </div>
   <UsersTable users={users} offset={newOffset} sessionUser={session?.user} />
  </div>
  )
}

export default Page