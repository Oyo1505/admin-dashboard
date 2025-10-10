'use client';
import useEmailsAutorized from '@/domains/auth/hooks/useEmailsAutorized';
import { Button } from '@/domains/ui/components/button/button';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

export const EmailAuthrizedEmailRow = ({
  email,
  hasPermission,
}: {
  email: string;
  hasPermission: boolean;
}) => {
  const { handleSubmit } = useForm();
  const { deleteEmailMutation } = useEmailsAutorized({ email });
  const t = useTranslations('Dashboard');
  return (
    <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 p-4 md:gap-8 ">
      <div>{email}</div>
      <form
        onSubmit={handleSubmit(() => deleteEmailMutation.mutate(email))}
        className="flex justify-end "
      >
        {hasPermission && (
          <Button
            variant={'destructive'}
            className="font-bold"
            type="submit"
            disabled={deleteEmailMutation.isPending}
          >
            {deleteEmailMutation.isPending ? t('deleting') : t('deleteButton')}
          </Button>
        )}
      </form>
    </div>
  );
};
