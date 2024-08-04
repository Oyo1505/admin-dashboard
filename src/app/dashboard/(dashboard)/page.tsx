
import React from 'react'
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import TitleDashboard from '@/components/dashboard/components/title-dashoard/tite-dashboard';

const Page = async () => {
  const session = await auth()
  if(!session?.user) return redirect('/')
  return (
    <div className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6'>    
      <TitleDashboard />
  </div>
  )
}

export default Page