import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SessionProvider } from "next-auth/react"
import {NextIntlClientProvider} from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import LayoutLogic from '../components/layout/components/layout-logic';
import MenuHeader from '../components/layout/components/menu-header/menu-header';
import { auth } from '@/lib/auth';


export const metadata = {
  title: '0y0Flix',
  description:
    'Mes goûts > vos goûts'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth()
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full bg-gray-50">
      <body>
        <SessionProvider session={session} >
        <NextIntlClientProvider messages={messages}>
         <LayoutLogic />
          <MenuHeader session={session}/>
            {children}
         <Analytics />
        </NextIntlClientProvider>
        </SessionProvider>
      </body>
   
    </html>
  );
}
