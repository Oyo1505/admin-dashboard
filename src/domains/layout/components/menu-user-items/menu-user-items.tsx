'use client';
import Image from 'next/image';
import ButtonLogout from '../../../ui/components/button-logout/button-logout';
import { useSession } from 'next-auth/react';

export function User({mobile=false}: {mobile: boolean}) {
  const {data: session} =  useSession();
  const user = session?.user;

  return (
    user &&
    <div className="flex items-center gap-4">
      <ButtonLogout />
      {!mobile && <Image
        className="h-8 w-8 rounded-full"
        src={user?.image!}
        height={32}
        width={32}
        alt={`${user?.name} avatar`}
      />}
 
    </div>
  );
}
