'use client'
import { Button } from '@/components/ui/components/button/button';
import { auth } from '@/lib/auth';
import { deleteUserById } from '@/components/dashboard/action';
import { useTranslations } from 'next-intl'
import React from 'react'
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const ButtonDeleteAccount = ({ translationTheme, translationText }: { translationTheme: string, translationText: string }) => {
  const t = useTranslations(translationTheme)
  const {data: session} = useSession()
  return (
    <Button 
    formAction={ async ()=>{
      const { status } = session?.user?.id && await deleteUserById(session?.user?.id)
      console.log(status)
      if(status !== 200){
        return redirect('/')
      }
      
      }}>
      {t(translationText)}
    </Button>
  )
}
export default ButtonDeleteAccount