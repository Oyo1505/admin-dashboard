'use client';
import { useSession } from '@/lib/auth-client';
import { URL_DASHBOARD_ROUTE, URL_HOME } from '@/shared/route';
import { redirect, usePathname } from 'next/navigation';

const useAuthStatus = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (session && pathname === '/') {
    redirect(URL_HOME);
  }

  if (
    session?.user?.role !== 'ADMIN' &&
    (pathname === URL_DASHBOARD_ROUTE.movie ||
      pathname.includes('edit-movie') ||
      pathname.includes('add-movie'))
  ) {
    redirect(URL_HOME);
  }
};

export default useAuthStatus;
