'use client'
import { User } from '@/app/user';
import LocaleSwitcher from '@/components/ui/components/LocaleSwitcher/locale-switcher';
import { URL_DASHBOARD, URL_HOME, URL_MOVIES } from '@/shared/route';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react'

const MenuMobile= ({session}: {session: any}) => {
  const t = useTranslations('Menu');
  const [isActive, setIsActive] = React.useState(false);
  
  const onClickMenu = () => {
    setIsActive(!isActive)
  }

  return (
    <>
    <button onClick={onClickMenu} className='absolute top-0 right-0 z-50 p-2 bg-slate-600 text-white'>menu</button>
    <div className={clsx(isActive ? 'left-0' : 'left-[-300px] ', 'absolute left-[-300px] top-0 transition-all duration-300 w-32 pl-3 pr-3 h-screen flex flex-col bg-slate-600 z-50 important')}>
    {session && <>
        <Link className='hover:text-red-600'
        href={URL_HOME}
        onClick={onClickMenu}
      >
        {t('home')}
      </Link>
      <Link
        className='hover:text-red-600'
        href={URL_MOVIES}
        replace={true}
        onClick={onClickMenu}
      >
        {t('movies')}
      </Link>
      <Link  onClick={onClickMenu}  className='hover:text-red-600' href={URL_DASHBOARD}>{t('dashboard')}</Link> 
      </>}
      {/* <User /> */}
      <LocaleSwitcher />
    </div>
    </>
  )
}

export default MenuMobile