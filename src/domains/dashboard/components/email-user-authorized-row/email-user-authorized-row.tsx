'use client';
import { deleteEmailAuthorized } from '@/domains/auth/action/action';
import { Button } from '@/domains/ui/components/button/button';
import { useTranslations } from 'next-intl';

export const EmailAuthrizedEmailRow = ({
  email,
  hasPermission,
}: {
  email: string;
  hasPermission: boolean;
}) => {
  const t = useTranslations('Dashboard');
  const deleteEmail = async () => {
    await deleteEmailAuthorized(email);
  };
  return (
    <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 p-4 md:gap-8 ">
      <div>{email}</div>
      <form className="flex justify-end ">
        {hasPermission && (
          <Button
            variant={'destructive'}
            className="font-bold"
            formAction={deleteEmail}
          >
            {t('deleteButton')}
          </Button>
        )}
      </form>
    </div>
  );
};
