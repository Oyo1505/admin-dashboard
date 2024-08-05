
import React from 'react'
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import TitleDashboard from '@/components/dashboard/components/title-dashoard/tite-dashboard';
import { getData } from '../../../googleDrive';
import { IMovieFileGoogleDrive } from '@/models/movie/movie';



const Page = async () => {
  const session = await auth()
  if(!session?.user) return redirect('/')
  return (
    <div className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6'>    
    {/* <iframe src="https://drive.google.com/file/d/1RejXffci857dzOlCF_cNagg2z9tX0SG8/preview" width="640" height="480" allow="autoplay"></iframe> */}
      <TitleDashboard />
  </div>
  )
}

export default Page