import { User } from '@/components/layout/components/menu-user-items/menu-user-items';
import Container from '@/components/ui/components/container/container';
import LocaleSwitcher from '@/components/ui/components/locale-switcher/locale-switcher';
import { URL_DASHBOARD, URL_HOME, URL_MOVIES } from '@/shared/route';
import Link from 'next/link'
import React from 'react'
import MenuMobile from '../menu-mobile/menu-mobile';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { Session } from 'next-auth';

const MenuHeader = async ({session}: {session: Session | null}) => {
  const t = await getTranslations('Menu');
  const userAgent = (await headers()).get('user-agent');
  const isMobileView = userAgent!.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  );
 
  return (
    
    isMobileView ? <MenuMobile session={session as Session | null}/> :
    <header className="group fixed w-full top-0 flex h-15  pt-2 pb-2 items-center gap-4 bg-background bg-opacity-90  z-20 justify-between lg:justify-end">
    <Container className='flex flex-row items-center justify-between gap-5'>
      <div className='flex items-center justify-start gap-5 '>
        {session && <>
        <Link className='hover:text-red-600 text-primary transition-all duration-300' prefetch href={URL_HOME}>{t('home')}</Link>
        <Link className='hover:text-red-600 text-primary transition-all duration-300' prefetch href={URL_MOVIES}>{t('movies')}</Link>
        <Link className='hover:text-red-600 text-primary transition-all duration-300' prefetch href={URL_DASHBOARD}>{t('dashboard')}</Link> 
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