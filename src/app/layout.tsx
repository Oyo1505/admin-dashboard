import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SessionProvider } from "next-auth/react"
import {NextIntlClientProvider} from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import LayoutLogic from '../components/layout/components/layout-logic';
import MenuHeader from '../components/layout/components/menu-header/menu-header';
import { auth } from '@/lib/auth';
import Container from '@/components/ui/components/container/container';
import { ReactElement, Suspense } from 'react';
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';

export const metadata = {
  title: 'Nūberu Bāgu',
  description:
    'Mes goûts > vos goûts'
};

export default async function RootLayout({
  children
}: {
  children: ReactElement;
}) {
  const session = await auth()
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} >
      <head>
        <meta name="googlebot" content="noindex"></meta>
      </head>
      <body className="h-full mb-14 relative background-background font-semibold">
        <SessionProvider session={session} >
        <NextIntlClientProvider messages={messages}>
         <LayoutLogic >
          <MenuHeader session={session} />
          <Suspense fallback={<LoadingSpinner />}>

            <Container className='pt-14'>
              {children}
            </Container>
          </Suspense>
          </LayoutLogic>
         <Analytics />
        </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
