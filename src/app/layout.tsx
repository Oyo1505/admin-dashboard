import LayoutLogic from '@/domains/layout/components/layout-logic';
import MenuHeader from '@/domains/layout/components/menu-header/menu-header';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import { auth } from '@/lib/auth';
import { Analytics } from '@vercel/analytics/react';
import { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ReactNode, Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nūberu Bāgu',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="googlebot" content="noindex, nofollow"></meta>
        <meta name="robots" content="noindex, nofollow"></meta>
      </head>
      <body className="h-full mb-14 mx-auto relative bg-background  text-primary font-semibold">
        <SessionProvider session={session}>
          <ToastContainer />
          <NextIntlClientProvider messages={messages}>
            <LayoutLogic>
              <MenuHeader session={session} />
              <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
            </LayoutLogic>
            <Analytics />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
