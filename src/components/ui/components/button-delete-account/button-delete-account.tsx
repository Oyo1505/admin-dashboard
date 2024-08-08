'use client'
import { Button } from '@/components/ui/components/button/button';
import { deleteUserById } from '@/components/dashboard/action';
import { useTranslations } from 'next-intl'
import React from 'react'
import { useSession } from 'next-auth/react';
import useUserStore from 'store/user/user-store';

const ButtonDeleteAccount = ({ translationTheme, translationText }: { translationTheme: string, translationText: string }) => {
  const {logout} = useUserStore(state => state);
  const t = useTranslations(translationTheme);
  const {data: session} = useSession();

  const deleteUser = async () => {
    session?.user?.id && await deleteUserById(session?.user?.id)
    logout()
  }

  return (
    <form>
    <Button 
    formAction={deleteUser}>
      {t(translationText)}
    </Button>
    </form>
  )
}
export default ButtonDeleteAccount