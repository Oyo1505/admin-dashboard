import { getUsers } from '@/lib/db';
import { Search } from 'app/search'
import { UsersTable } from 'app/users-table'
import React from 'react'

const Page = async ({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) => {
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 0;
  const { users, newOffset } = await getUsers(search, Number(offset));
  return (
    <div>    
      <div className="flex items-center mb-8">
    <h1 className="font-semibold text-lg md:text-2xl">Users</h1>
  </div>
  <div className="w-full mb-4">
    <Search value={searchParams.q} />
  </div>
   <UsersTable users={users} offset={newOffset} />
  </div>
  )
}

export default Page