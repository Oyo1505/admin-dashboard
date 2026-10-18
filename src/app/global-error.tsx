'use client';
import { useEffect } from 'react';

/**
 * Last-resort error boundary: it replaces the root layout, so i18n
 * providers and styles are not available. Never show error.message
 * to the user, only the digest so support can find the server log.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '1rem',
          background: '#121212',
          color: '#f5f5f5',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <main>
          <h1>Une erreur est survenue</h1>
          <p>Veuillez réessayer. Si le problème persiste, contactez-nous.</p>
          {error.digest && (
            <p>
              <small>Référence : {error.digest}</small>
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              border: '2px solid #f5f5f5',
              borderRadius: '0.375rem',
              background: 'transparent',
              color: '#f5f5f5',
              cursor: 'pointer',
            }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
