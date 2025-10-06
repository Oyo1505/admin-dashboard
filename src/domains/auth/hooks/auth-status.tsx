'use client';
import { useSession } from '@/lib/auth-client';
import { logError } from '@/lib/errors';
import { URL_DASHBOARD_ROUTE, URL_HOME } from '@/shared/route';
import useUserStore from '@/store/user/user-store';

import { redirect, usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';

const useAuthStatus = () => {
  const { user, fetchUser, setUser } = useUserStore((state) => state);
  const pathname = usePathname();
  const { data: session } = useSession();

  const fetchSession = useCallback(async () => {
    try {
      if (session?.user?.email) {
        await fetchUser(session.user.email);
      }
    } catch (error) {
      logError(error, 'useAuthStatus');
    }
  }, [session?.user?.email, fetchUser]);

  useEffect(() => {
    if (session?.user && Object.keys(user).length === 0) {
      fetchSession();
    }
  }, [session, user, fetchSession]);

  useEffect(() => {
    if (session && pathname === '/') {
      redirect(URL_HOME);
    }
  }, [session, pathname]);

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

  useEffect(() => {
    if (!session && pathname === '/') {
      setUser({}, false);
    }
  }, [session, pathname, setUser]);
  return;
};

export default useAuthStatus;
