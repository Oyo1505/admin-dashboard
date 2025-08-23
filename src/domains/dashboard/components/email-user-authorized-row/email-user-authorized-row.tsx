'use client';
import { deleteEmailAuthorized } from '@/domains/auth/actions/action.email';
import { Button } from '@/domains/ui/components/button/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export const EmailAuthrizedEmailRow = ({
  email,
  hasPermission,
}: {
  email: string;
  hasPermission: boolean;
}) => {
  const { handleSubmit } = useForm();
  const queryClient = useQueryClient();

  const deleteEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const { status } = await deleteEmailAuthorized(email);
      if (status === 200) {
        toast.success('Email deleted successfully');
      } else {
        toast.error('Email not deleted');
      }
      return { status, email };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users-mails-authorized'],
        exact: false,
      });
    },
  });

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
