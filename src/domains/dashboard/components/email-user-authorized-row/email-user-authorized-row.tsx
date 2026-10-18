'use client';
import useEmailsAutorized from '@/domains/auth/hooks/use-emails-autorized';
import ConfirmDialog from '@/domains/ui/components/confirm-dialog/confirm-dialog';
import { useTranslations } from 'next-intl';

export const EmailAuthrizedEmailRow = ({
  email,
  hasPermission,
}: {
  email: string;
  hasPermission: boolean;
}) => {
  const { deleteEmailMutation } = useEmailsAutorized({ email });
  const t = useTranslations('Dashboard');

  return (
    <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 p-4 md:gap-8 ">
      <div>{email}</div>
      <div className="flex justify-end">
        {hasPermission && (
          <ConfirmDialog
            triggerLabel={
              deleteEmailMutation.isPending ? t('deleting') : t('deleteButton')
            }
            triggerAriaLabel={`${t('deleteButton')} ${email}`}
            title={t('confirmDeleteEmailTitle', { email })}
            description={t('confirmDeleteDescription')}
            confirmLabel={t('deleteButton')}
            cancelLabel={t('cancel')}
            disabled={deleteEmailMutation.isPending}
            onConfirm={() => deleteEmailMutation.mutate(email)}
          />
        )}
      </div>
    </div>
  );
};
