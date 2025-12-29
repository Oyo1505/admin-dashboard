'use client';
import { useSession } from '@/lib/auth-client';
import Image from 'next/image';
import { Activity } from 'react';
import ButtonLogout from '../../../ui/components/button-logout/button-logout';

export function User({ mobile = false }: { mobile: boolean }) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    user && (
      <div className="flex items-center gap-4">
        <ButtonLogout />
        <Activity mode={mobile ? 'visible' : 'hidden'}>
          <Image
            className="h-8 w-8 rounded-full"
            src={user?.image ?? ''}
            height={32}
            priority
            width={32}
            alt={`${user?.name} avatar`}
          />
        </Activity>
      </div>
    )
  );
}
