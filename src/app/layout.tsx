import UploadProgressWrapper from '@/domains/dashboard/components/upload-progress-indicator/upload-progress-wrapper';
import LayoutLogic from '@/domains/layout/components/layout-logic';
import MenuHeader from '@/domains/layout/components/menu-header/menu-header';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import TanstackProvider from '@/providers/tanstack-provider';
import { Analytics } from '@vercel/analytics/react';
import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { toHtmlLang } from '@/shared/utils/locale/toHtmlLang';
import { ReactNode, Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import './globals.css';
export const metadata: Metadata = {
  title: 'Nūberu Bāgu',
  description: 'Bienvenue sur Nūberu Bāgu',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nūberu Bāgu',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/icon-192.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations('Accessibility');

  return (
    <html lang={toHtmlLang(locale)}>
      <head>
        <meta name="googlebot" content="noindex, nofollow"></meta>
        <meta name="robots" content="noindex, nofollow"></meta>
      </head>
      <body
        className={`h-full mb-14 mx-auto relative bg-background text-primary font-semibold `}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-background focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          {t('skipToContent')}
        </a>
        <ToastContainer />
        <NextIntlClientProvider messages={messages}>
          <TanstackProvider>
            <LayoutLogic>
              <Suspense fallback={null}>
                <MenuHeader />
              </Suspense>
              <main id="main-content" tabIndex={-1} className="outline-hidden">
                <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
              </main>
            </LayoutLogic>
            <UploadProgressWrapper />
            <Analytics />
          </TanstackProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
