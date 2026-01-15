'use client';
import { Button } from '@/domains/ui/components/button/button';
import { Input } from '@/domains/ui/components/input/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Activity } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import useEmailsAutorized from '../../hooks/useEmailsAutorized';

const formSchema = z.object({
  email: z.string().email().min(1, { message: 'Email is required' }),
});

type FormData = z.infer<typeof formSchema>;

const FormAddEmailAuthrizedEmail = ({
  hasPermission,
}: {
  hasPermission: boolean;
}) => {
  const t = useTranslations('Dashboard');

  const { handleSubmit, register, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });
  const { addEmailMutation } = useEmailsAutorized({ reset });

  const onSubmit = (data: FormData) => {
    addEmailMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <Activity mode={hasPermission ? 'visible' : 'hidden'}>
        <Input
          aria-label="input-add-email-authorized"
          placeholder="Email"
          type="email"
          autoComplete="email"
          className="w-full mb-4 text-background bg-primary"
          {...register('email', {
            required: true,
          })}
        />
        <Button
          type="submit"
          className="w-full mb-4"
          disabled={addEmailMutation.isPending}
        >
          <Activity mode={addEmailMutation.isPending ? 'visible' : 'hidden'}>
            {t('loading')}
          </Activity>
          <Activity mode={addEmailMutation.isPending ? 'hidden' : 'visible'}>
            {t('addButton')}
          </Activity>
        </Button>
      </Activity>
    </form>
  );
};

export default FormAddEmailAuthrizedEmail;
