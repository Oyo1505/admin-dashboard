'use client'
import ButtonLogin from '@/components/ui/components/button-login/button-login'
import Container from '@/components/ui/components/container/container'
import { URL_LEGAL_MENTIONS, URL_PRIVACY } from '@/shared/route'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import React from 'react'

const LandingPage =  () => {
  const session = useSession()
  const t = useTranslations('LandingPage');
 
  return (
    session.status === 'unauthenticated' &&
    <Container>
    <div className="h-screen flex flex-col items-center justify-center">
      <div className='flex flex-col gap-5 justify-center items-center'>
        <h1 className='text-5xl text-center'>{t('welcome')}</h1>
        <div>{t('title')}</div>
        <ButtonLogin />
      </div>
      <div className='text-center flex gap-6'>
        <Link href={URL_PRIVACY} >{t('privacy')}</Link>
        <Link href={URL_LEGAL_MENTIONS}>{t('legalMentions')}</Link>
      </div>
    </div>
    </Container>
  )
}

export default LandingPage