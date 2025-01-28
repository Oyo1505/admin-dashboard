'use client'
import React from 'react'
import { Button } from '../button/button'
import { useTranslations } from 'next-intl'
import useUserStore from 'store/user/user-store'

const ButtonLogout = () => {
  
  const { logout } = useUserStore((state) => state)
  const t = useTranslations('Menu');
  
  const onClick = async () => {
    logout()
  }

  return (
    <Button className='transition-all hover:cursor-pointer duration-300' onClick={onClick}>{t('logout')}</Button>
  )
}

export default ButtonLogout