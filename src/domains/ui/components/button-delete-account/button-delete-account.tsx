'use client'
import { Button } from '@/domains/ui/components/button/button';
import { deleteUserByIdFromUser } from '@/domains/dashboard/action';
import React from 'react'
import * as Dialog  from '@radix-ui/react-dialog'
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import useUserStore from 'store/user/user-store';

const ButtonDeleteAccount = ({ translationTheme, translationText, className}: { translationTheme: string, translationText: string, className:string }) => {
  const { logout } = useUserStore(state => state);
  const t = useTranslations(translationTheme);
  const { data: session } = useSession();
	
  const deleteUser = async () => {
    session?.user?.id && (await deleteUserByIdFromUser(session?.user?.id))
    logout()
  }

  return (
    <>
 	<Dialog.Root>
		<Dialog.Trigger asChild>
    <Button 
      variant={'destructive'}
      className={className}>
				 {t(translationText)}
			</Button>
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Overlay className="fixed inset-0 bg-background opacity-60 data-[state=open]:animate-overlayShow" />
			<Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-hidden data-[state=open]:animate-contentShow">
				<Dialog.Title className="m-0 text-[17px] font-medium text-black">
				  {t(translationText)}
				</Dialog.Title>
				<Dialog.Description className="mb-5 mt-2.5 text-[15px] leading-normal text-black">
        {t('areYouSure')}
				</Dialog.Description>
   
		
				
				<div className="mt-[25px] flex justify-end gap-3">	
        <Dialog.Close asChild>
           <Button variant={'outline'}>
             {t('cancel')}
						</Button>
					</Dialog.Close>
          <form>
						<Button variant={'destructive'} formAction={deleteUser}>
             {t(translationText)}
						</Button>
          </form>
				</div>
				<Dialog.Close asChild>
					<button
						className="absolute text-black right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-hidden"
						aria-label="Close"
					>
					X
					</button>
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>

    </>
  )
}
export default ButtonDeleteAccount