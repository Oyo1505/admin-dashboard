import { User } from '@/app/user';
import Container from '@/components/ui/components/container/container';
import LocaleSwitcher from '@/components/ui/components/LocaleSwitcher/locale-switcher';
import { URL_DASHBOARD, URL_HOME, URL_MOVIES } from '@/shared/route';
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

const MenuHeader = ({session}: {session: any}) => {
 
  const t = useTranslations('Menu');

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 justify-between lg:justify-end">
    <Container className='flex items-center justify-end gap-5'>
      {session && <>
        <Link className='hover:text-red-600'
        href={URL_HOME}
      >
        {t('home')}
      </Link>
      <Link
      className='hover:text-red-600'
        href={URL_MOVIES}
        replace={true}
      >
        {t('movies')}
      </Link>
      <Link  className='hover:text-red-600' href={URL_DASHBOARD}>{t('dashboard')}</Link> 
      </>}
      <User />
      <LocaleSwitcher />
    </Container>
  </header>
  )
}

export default MenuHeader