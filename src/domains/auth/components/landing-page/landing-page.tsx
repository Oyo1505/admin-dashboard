'use client';
import ButtonLogin from '@/domains/ui/components/button-login/button-login';
import Container from '@/domains/ui/components/container/container';
import { useSession } from '@/lib/auth-client';
import { URL_LEGAL_MENTIONS, URL_PRIVACY } from '@/shared/route';
import useUserStore from '@/store/user/user-store';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { Lobster } from 'next/font/google';
import Link from 'next/link';

const lobster = Lobster({
  weight: '400',
  display: 'swap',
  subsets: ['latin'],
});
const LandingPage = () => {
  const { data: session } = useSession();
  const { user } = useUserStore();
  const t = useTranslations('LandingPage');

  return (
    session === null ||
    (!user && (
      <Container>
        <div className="h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col gap-5 justify-center items-center">
            <h1 className={clsx(lobster.className, 'text-5xl text-center')}>
              {t('welcome')}
            </h1>
            <div>{t('title')}</div>
            <ButtonLogin />
          </div>
          <div className="text-center flex gap-6 mt-5">
            <Link href={URL_PRIVACY}>{t('privacy')}</Link>
            <Link href={URL_LEGAL_MENTIONS}>{t('legalMentions')}</Link>
          </div>
        </div>
      </Container>
    ))
  );
};

export default LandingPage;
