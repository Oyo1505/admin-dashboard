'use client';
import { Button } from '@/domains/ui/components/button/button';
import { Input } from '@/domains/ui/components/input/input';
import React from 'react';
import { postAuthorizedEmail } from '../../action/action';
import { useTranslations } from 'next-intl';

const FormAddEmailAuthrizedEmail = ({
  hasPermission,
}: {
  hasPermission: boolean;
}) => {
  const [email, setEmail] = React.useState('');
  const t = useTranslations('Dashboard');
  const postAuthorizedEmailForm = async () => {
    const { status } = await postAuthorizedEmail(email);
    if (status === 200) {
      return setEmail('');
    }
  };
  return (
    <form>
      {hasPermission && (
        <>
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4  text-background bg-primary"
          />
          <Button formAction={postAuthorizedEmailForm} className="w-full mb-4">
            {t('addButton')}
          </Button>
        </>
      )}
    </form>
  );
};

export default FormAddEmailAuthrizedEmail;
