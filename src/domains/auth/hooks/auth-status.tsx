'use client';
import { useSession } from '@/lib/auth-client';
import { logError } from '@/lib/errors';
import { URL_DASHBOARD_ROUTE, URL_HOME } from '@/shared/route';
import useUserStore from '@/store/user/user-store';

import { redirect, usePathname } from 'next/navigation';
import { useEffect, useEffectEvent } from 'react';

const useAuthStatus = () => {
  const { user, fetchUser, setUser } = useUserStore((state) => state);
  const pathname = usePathname();
  const { data: session } = useSession();

  const fetchSession = useEffectEvent(() => {
    if (session?.user && Object.keys(user).length === 0) {
      try {
        if (session?.user?.email) {
          fetchUser(session.user.email);
        }
      } catch (error) {
        logError(error, 'useAuthStatus');
      }
    }
  });

  useEffect(() => {
    fetchSession();
  }, [session, user]);

  useEffect(() => {
    if (session && pathname === '/') {
      redirect(URL_HOME);
    }
    if (!session && Object.keys(user).length > 0) {
      setUser({}, false);
    }
  }, [session, pathname, setUser, user]);

  useEffect(() => {
    if (
      user &&
      'role' in user &&
      user.role !== 'ADMIN' &&
      (pathname === URL_DASHBOARD_ROUTE.movie ||
        pathname.includes('edit-movie') ||
        pathname.includes('add-movie'))
    ) {
      redirect(URL_HOME);
    }
  }, [user, pathname]);

  return;
};

export default useAuthStatus;
