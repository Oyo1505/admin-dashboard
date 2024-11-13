'use client'
import React from 'react'
import { Button } from '../button/button'
import { useTranslations } from 'next-intl'
import useUserStore from 'store/user/user-store'
import { GoogleLogo } from '../icons/icons'

const ButtonLogin = () => {
  const { login } = useUserStore((state) => state)
  const t = useTranslations('LandingPage');
  return (
    <Button onClick={login} variant='outline' className='text-white w-full  font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 mb-2'>
      <GoogleLogo />
        {t('login')}
      </Button>
  )
}

export default ButtonLogin