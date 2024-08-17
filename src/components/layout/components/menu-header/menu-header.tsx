import { User } from '@/app/user';
import Container from '@/components/ui/components/container/container';
import LocaleSwitcher from '@/components/ui/components/LocaleSwitcher/locale-switcher';
import { URL_DASHBOARD, URL_HOME, URL_MOVIES } from '@/shared/route';
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'
import { headers } from 'next/headers';
import MenuMobile from '../menu-mobile/menu-mobile';

const MenuHeader = ({session}: {session: any}) => {
 
  const t = useTranslations('Menu');
  const headersList = headers();

  const userAgent = headersList.get('user-agent');
  const isMobileView = userAgent!.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  );
 
  return (
    isMobileView ? <MenuMobile session={session}/> : 
    <header className="group fixed w-full flex h-15  pt-2 pb-2 items-center gap-4 bg-background bg-opacity-90  z-20 justify-between lg:justify-end">
    <Container className='flex flex-row items-center justify-between gap-5'>
      <div className='flex items-center justify-start gap-5 '>
        {session && <>
          <Link className='hover:text-red-600 text-primary transition-all duration-300'
          href={URL_HOME}
        >
          {t('home')}
        </Link>
        <Link
        className='hover:text-red-600 text-primary transition-all duration-300'
          href={URL_MOVIES}
          //replace={true}
        >
          {t('movies')}
        </Link>
        <Link  className='hover:text-red-600 text-primary transition-all duration-300' href={URL_DASHBOARD}>{t('dashboard')}</Link> 
        </>}
      </div>

      <div className='flex items-center justify-end gap-5'>
        <User mobile={false} />
        <LocaleSwitcher />
      </div>
    </Container>
  </header>
  )
}

export default MenuHeader