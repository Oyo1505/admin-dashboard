'use client';
import { logError } from '@/lib/errors';
import {
  URL_DASHBOARD_ROUTE,
  URL_HOME,
  URL_LEGAL_MENTIONS,
  URL_PRIVACY,
} from '@/shared/route';
import useUserStore from '@/store/user/user-store';
import { useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';

const useAuthStatus = () => {
  const { user, fetchUser, setUser, logout } = useUserStore((state) => state);
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
  }, [session, fetchUser]);

  const logoutSession = useCallback(async () => {
    try {
      await logout();
      setUser({}, false);
    } catch (error) {
      logError(error, 'logoutSession');
      setUser({}, false);
    }
  }, [logout, setUser]);

  useEffect(() => {
    if (session && Object.keys(user).length === 0) {
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
    if (
      !session &&
      pathname !== '/' &&
      pathname !== URL_LEGAL_MENTIONS &&
      pathname !== URL_PRIVACY
    ) {
      logoutSession();
    }
  }, [session, pathname, logoutSession]);

  return;
};

export default useAuthStatus;
