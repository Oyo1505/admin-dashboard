import { User } from '@/app/user'
import { Session } from 'next-auth'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

const MenuHeader = ({session}: {session: Session}) => {
  const t = useTranslations('Menu');
  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 justify-between lg:justify-end">
    <Link
      href="/"
    >
      {t('home')}
    </Link>
    {session && <Link href='dashboard'>{t('dashboard')}</Link> }
    <User />
  </header>
  )
}

export default MenuHeader