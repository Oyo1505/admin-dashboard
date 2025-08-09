'use client'
import { URL_DASHBOARD_MOVIE, URL_HOME, URL_LEGAL_MENTIONS, URL_PRIVACY } from "@/shared/route"
import { useSession } from "next-auth/react"
import { redirect, usePathname } from "next/navigation"
import { useEffect, useCallback } from 'react'
import useUserStore from "store/user/user-store"

const useAuthStatus = () => {
  const {user, fetchUser, setUser, logout} = useUserStore((state) => state);
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const fetchSession = useCallback(async () => {
    try {
      if (session?.user?.email) {
        await fetchUser(session.user.email);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
  }, [session, fetchUser]);

  const logoutSession = useCallback(async () => {
    try {
      await logout();
      setUser({}, false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
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
    if (user && 'role' in user && user.role !== 'ADMIN' && 
        (pathname === URL_DASHBOARD_MOVIE || 
         pathname.includes('edit-movie') || 
         pathname.includes('add-movie'))) {
      redirect(URL_HOME);
    }
  }, [user, pathname]);

  useEffect(() => {
    if (!session && 
        pathname !== '/' && 
        pathname !== URL_LEGAL_MENTIONS && 
        pathname !== URL_PRIVACY) {
      logoutSession();
    }
  }, [session, pathname, logoutSession]);

  return;
}

export default useAuthStatus