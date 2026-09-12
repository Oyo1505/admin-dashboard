'use client';
import { useSession } from '@/lib/auth-client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ButtonLogout from '../../../ui/components/button-logout/button-logout';

interface InitialUser {
  name?: string | null;
  image?: string | null;
}

export function User({
  mobile = false,
  initialUser = null,
}: {
  mobile: boolean;
  initialUser?: InitialUser | null;
}) {
  const { data: session } = useSession();
  // Same rationale as MenuHeaderItems: use the server-resolved user for the
  // first render so it matches SSR, then hand off to the reactive client
  // session (e.g. for sign-out) once mounted, to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const user = mounted ? session?.user : initialUser;

  return (
    <>
      {user && (
        <div className="flex items-center gap-4">
          <ButtonLogout />
          {user?.image && !mobile && (
            <Image
              className="h-8 w-8 rounded-full"
              src={user?.image}
              height={32}
              priority
              width={32}
              alt={`${user?.name} avatar`}
            />
          )}
        </div>
      )}
    </>
  );
}
