'use client'
import React from 'react'
import { Button } from '../button/button'
import { useTranslations } from 'next-intl'
import useUserStore from 'store/user/user-store'

const ButtonLogout = () => {
  
  const { removeUser } = useUserStore((state: any) => state)
  const t = useTranslations('Menu');

  const onClick = async () => {
    removeUser()
  }
  return (
    <Button onClick={onClick}>{t('logout')}</Button>
  )
}

export default ButtonLogout