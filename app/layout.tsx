import './globals.css';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';
import { User } from './user';
import { auth } from '@/lib/auth';
import { SessionProvider } from "next-auth/react"
import LayoutLogic from '@/components/layout/components/layout-logic';
import {NextIntlClientProvider} from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import LocaleSwitcherSelect from '../components/ui/components/locale-switcher-select/locale-switcher-select'

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
  console.log(messages, locale)
  return (
    <html lang={locale} className="h-full bg-gray-50">
      <body>
        <SessionProvider session={session} >
        <NextIntlClientProvider messages={messages}>
          <LocaleSwitcherSelect defaultValue='fr' label={'test'} items={[{ value: 'jp', label:'jp'}, {value: 'fr' ,label: 'fr'}]} />
         <LayoutLogic />
            <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 justify-between lg:justify-end">
              <Link
                href="/"
              >
                Home
              </Link>
              {session && <Link href='dashboard'>Dashboard</Link> }
              <User />
            </header>
            {children}
       
         <Analytics />
        </NextIntlClientProvider>
        </SessionProvider>
      </body>
   
    </html>
  );
}
