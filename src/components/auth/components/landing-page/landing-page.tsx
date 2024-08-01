'use client'
import ButtonLogin from '@/components/ui/components/button-login/button-login'
import { useTranslations } from 'next-intl'
import React from 'react'
import useUserStore from 'store/user/user-store'

const LandingPage =  () => {
  const {connected} = useUserStore((state) => state)
  const t = useTranslations('LandingPage');
  return (
    !connected &&
    <div className="h-screen flex items-center justify-center">
      <div className='flex flex-col gap-5 justify-center items-center'>
        <h2>{t('welcome')}</h2>
        <div>{t('title')}</div>
        <ButtonLogin />
      </div>
    </div>
  )
}

export default LandingPage