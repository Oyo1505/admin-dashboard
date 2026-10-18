'use client';

import { logError } from '@/lib/errors';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('ErrorMessage');

  useEffect(() => {
    logError(error, 'Error');
  }, [error]);

  // Never show error.message: it can leak internal details
  return (
    <div className="p-4 flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p>{t('description')}</p>
      {error.digest && (
        <p className="text-sm">{t('reference', { digest: error.digest })}</p>
      )}
      <button
        type="button"
        onClick={() => reset()}
        className="border-2 border-primary text-primary p-2 rounded-md cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {t('retry')}
      </button>
    </div>
  );
}
