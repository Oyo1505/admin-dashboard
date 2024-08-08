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

      <body className="h-full bg-gray-50 font-semibold">
        <SessionProvider session={session} >
        <NextIntlClientProvider messages={messages}>
         <LayoutLogic >
          <MenuHeader session={session}/>
          <Suspense fallback={<p>Loading...</p>}>
            <Container >
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
