'use client';

import { logError } from '@/lib/errors';
import { useEffect, useState } from 'react';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    logError(error, 'Error');
    setErrorMessage(error.message);
  }, [error]);

  return (
    <main className="p-4 flex h-screen w-full flex-col items-center justify-center">
      <div className="mb-8 space-y-4">ERROR : {errorMessage}</div>
    </main>
  );
}
