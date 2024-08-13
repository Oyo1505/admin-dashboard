'use client'
import ButtonLogin from '@/components/ui/components/button-login/button-login'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import React from 'react'

const LandingPage =  () => {
  const session = useSession()
  const t = useTranslations('LandingPage');

  return (
    session.status === 'unauthenticated' &&
    <div className="h-screen flex items-center justify-center">
      <div className='flex flex-col gap-5 justify-center items-center'>
        <h1 className='text-5xl text-center'>{t('welcome')}</h1>
        <div>{t('title')}</div>
        <ButtonLogin />
      </div>
    </div>
  )
}

export default LandingPage