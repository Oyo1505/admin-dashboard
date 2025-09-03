'use client';
import { Button } from '@/domains/ui/components/button/button';
import { URL_DASHBOARD, URL_HOME, URL_MOVIES } from '@/shared/route';
import { Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center space-y-8 p-8">
        <div className="relative">
          <h1 className="text-9xl font-bold text-slate-200 dark:text-slate-700 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl animate-bounce">🎬</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
            {t('pageNotFound')}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              {t('backToHome')}
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href={URL_MOVIES}>{t('moviesPage')}</Link>
          </Button>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {t('popularPage')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href={URL_HOME}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              {t('home')}
            </Link>
            <Link
              href={URL_MOVIES}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              {t('movies')}
            </Link>
            <Link
              href={URL_DASHBOARD}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              {t('dashboard')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
