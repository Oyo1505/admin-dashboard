'use client'
import { useTranslations } from 'next-intl'
import React from 'react'
import useUserStore from 'store/user/user-store'
import ContinueWatching from '../continue-watching/continue-watching'

const TitleDashboard = () => {
  const t = useTranslations('Dashboard')
  const {user} = useUserStore(state => state)
  return (
    <div>
      <h1 className='text-2xl'>{t('welcome')}, {user?.name}</h1>
      <ContinueWatching />
    </div>
  )
}

export default TitleDashboard