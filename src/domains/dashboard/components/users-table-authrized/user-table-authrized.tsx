'use client'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getAuthorizedEmails } from '@/domains/auth/action/action'
import { EmailAuthrizedEmailRow } from '../email-user-authorized-row/email-user-authorized-row'
import { useTranslations } from 'next-intl'

export const UserTableAuthrized = ({ hasPermission }: { hasPermission: boolean }) => {
  const [page, setPage] = useState(0)

  const { isPending, isError, error, data, isFetching, isPlaceholderData } =
    useQuery({
      queryKey: ['mails', page],
      queryFn: () => getAuthorizedEmails({ pageParam: page * 5 }),
      placeholderData: keepPreviousData,
      staleTime: 0,
      refetchOnWindowFocus: false,
    })
    const  t  = useTranslations('Dashboard')
  return (
    <div>
      {isPending || isFetching ? (
        <div className="mt-2 block text-center min-h-[400px]">{t('loading')}</div>
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
              className='bg-blue-500 text-white p-2 rounded-md cursor-pointer disabled:opacity-50'
            >
                {t('previousPage')}
            </button>
            <button
              onClick={() => {
                if (!isPlaceholderData && data?.mails?.length === 5) {
                  setPage((old) => old + 1)
                }
              }}
              disabled={isPlaceholderData || (data?.mails?.length ?? 0) < 5}
              className='bg-blue-500 text-white p-2 rounded-md cursor-pointer disabled:opacity-50'
            >
              {t('nextPage')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}