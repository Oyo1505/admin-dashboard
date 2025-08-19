'use client';
import { Button } from '@/domains/ui/components/button/button';
import { Input } from '@/domains/ui/components/input/input';
import React, { useEffect, useState } from 'react';
import { postAuthorizedEmail } from '../../action/action';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const formSchema = z.object({
  email: z.string().email().min(1, { message: 'Email is required' }),
});

const FormAddEmailAuthrizedEmail = ({
  hasPermission,
}: {
  hasPermission: boolean;
}) => {
  const t = useTranslations('Dashboard');
  const queryClient = useQueryClient();
  const [isHydrated, setIsHydrated] = useState(false);

  const { handleSubmit, register, reset } = useForm<z.infer<typeof formSchema>>(
    {
      defaultValues: {
        email: '',
      },
    }
  );

  const addEmailMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const { status, message } = await postAuthorizedEmail(data.email);
      if (status === 200) {
        toast.success(t('userEmailAdded'));
        reset();
      } else if (status === 409) {
        toast.error(message || 'Email already authorized');
      } else {
        toast.error('Failed to add email');
      }
      return { status, email: data.email };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users-mails-authorized'],
        exact: false,
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    addEmailMutation.mutate(data);
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Ne pas rendre le formulaire jusqu'à ce que l'hydratation soit terminée
  if (!isHydrated) {
    return (
      <form className="w-full">
        {hasPermission && (
          <>
            <Input
              placeholder="Email"
              type="email"
              className="w-full mb-4  text-background bg-primary"
              autoComplete="off"
              disabled
            />
            <Button type="submit" className="w-full mb-4" disabled>
              {t('addButton')}
            </Button>
          </>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {hasPermission && (
        <>
          <Input
            placeholder="Email"
            type="email"
            className="w-full mb-4  text-background bg-primary"
            autoComplete="off"
            {...register('email', {
              required: true,
            })}
          />
          <Button
            type="submit"
            className="w-full mb-4"
            disabled={addEmailMutation.isPending}
          >
            {addEmailMutation.isPending ? t('loading') : t('addButton')}
          </Button>
        </>
      )}
    </form>
  );
};

export default FormAddEmailAuthrizedEmail;
