import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { auth } from '@/lib/auth';
import { SessionProvider } from "next-auth/react"
import LayoutLogic from '@/components/layout/components/layout-logic';
import {NextIntlClientProvider} from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import LocaleSwitcher from '@/components/ui/components/LocaleSwitcher/locale-switcher';
import MenuHeader from '@/components/layout/components/menu-header/menu-header';

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
        <LocaleSwitcher />
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
