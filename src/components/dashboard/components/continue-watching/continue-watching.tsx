'use client'
import { useTranslations } from 'next-intl'
import React from 'react'


const ContinueWatching = () => {
  const t = useTranslations('Dashboard')
  return (
    <div className='mt-7'>
    
      <h1 className='text-lg text-primary'>{t('continue')}</h1>
      <div>{/*TODO*/}</div>
    </div>
  )
}

export default ContinueWatching