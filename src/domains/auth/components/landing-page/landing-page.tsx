'use client';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import ButtonLogin from '@/domains/ui/components/button-login/button-login';
import Container from '@/domains/ui/components/container/container';
import { useSession } from '@/lib/auth-client';
import { useHydrated } from '@/shared/hooks/use-hydrated';
import { URL_LEGAL_MENTIONS, URL_PRIVACY } from '@/shared/route';
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
  // Read the cookie only after hydration: the server cannot see it, so the
  // first client render must match the server output (no hydration mismatch)
  const isHydrated = useHydrated();
  const isTestMode =
    isHydrated && document.cookie.includes('playwright_test_mode=true');

  // Hooks must run on every render: override the result in test mode
  const sessionState = useSession();
  const { data: session, isPending } = isTestMode
    ? { data: null, isPending: false }
    : sessionState;

  const t = useTranslations('LandingPage');

  const userIsNotLogged = session === null && !isPending;

  return (
    <Container>
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col gap-5 justify-center items-center">
          <h1 className={clsx(lobster.className, 'text-5xl text-center')}>
            {t('welcome')}
          </h1>
          {userIsNotLogged && (
            <>
              <div>{t('title')}</div>
              <ButtonLogin />
            </>
          )}

          {isPending && <LoadingSpinner data-testid={'loading-spinner'} />}
        </div>
        <div className="text-center flex gap-6 mt-5">
          <Link href={URL_PRIVACY}>{t('privacy')}</Link>
          <Link href={URL_LEGAL_MENTIONS}>{t('legalMentions')}</Link>
        </div>
      </div>
    </Container>
  );
};

export default LandingPage;
