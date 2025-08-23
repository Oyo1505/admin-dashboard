'use client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { EmailAuthrizedEmailRow } from '../email-user-authorized-row/email-user-authorized-row';
import { getAuthorizedEmailsPagination } from '@/domains/auth/actions/action.email';

export const UserTableAuthorized = ({
  hasPermission,
}: {
  hasPermission: boolean;
}) => {
  const [page, setPage] = useState(0);

  const { isPending, isError, error, data, isFetching, isPlaceholderData } =
    useQuery({
      queryKey: ['users-mails-authorized', page],
      queryFn: async () =>
        await getAuthorizedEmailsPagination({ pageParam: page * 5 }),
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
    });

  const t = useTranslations('Dashboard');

  return (
    <div>
      {isPending || isFetching ? (
        <div className="mt-2 block text-center min-h-[400px]">
          {t('loading')}
        </div>
      ) : isError ? (
        <div>Erreur: {error.message}</div>
      ) : (
        <div>
          <div className="grid gap-4 min-h-[400px]">
            {data?.mails?.map((mail) => (
              <EmailAuthrizedEmailRow
                hasPermission={hasPermission}
                key={mail.id}
                email={mail.email ?? ''}
              />
            ))}
          </div>

          <div className="flex gap-4 mt-4 justify-center">
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 0))}
              disabled={page === 0}
              className="border-2 border-white text-white p-2 rounded-md cursor-pointer disabled:opacity-50"
            >
              {t('previousPage')}
            </button>
            <button
              onClick={() => {
                if (!isPlaceholderData && data?.mails?.length === 5) {
                  setPage((old) => old + 1);
                }
              }}
              disabled={isPlaceholderData || (data?.mails?.length ?? 0) < 5}
              className="border-2 border-white text-white p-2 rounded-md cursor-pointer disabled:opacity-50"
            >
              {t('nextPage')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
