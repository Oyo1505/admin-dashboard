import './globals.css';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';
import { User } from './user';
import { auth } from '@/lib/auth';
import { SessionProvider } from "next-auth/react"
import LayoutLogic from '@/components/layout/components/layout-logic';
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
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body>
        <SessionProvider session={session} >
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
        </SessionProvider>
      </body>
   
    </html>
  );
}
