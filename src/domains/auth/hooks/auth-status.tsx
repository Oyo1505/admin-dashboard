'use client'
import { URL_DASHBOARD_MOVIE, URL_HOME, URL_LEGAL_MENTIONS, URL_PRIVACY } from "@/shared/route"
import { useSession } from "next-auth/react"
import { redirect, usePathname } from "next/navigation"
import { useEffect } from 'react'
import useUserStore from "store/user/user-store"

const useAuthStatus = async () => {
  const {user, fetchUser, connected, setUser, logout} = useUserStore((state) => state);
  const pathname = usePathname();
  const {  data: session,  } = useSession();
  const fetchSession = async () => {
    try {
      session && session?.user?.email &&  (await fetchUser(session?.user?.email));  
    } catch (error) {
      console.log(error)
    }
  };
  const logoutSession = async () => {
    try {
      setUser({}, false)
      await logout()
    } catch (error) {
      console.log(error)
    }
  };
  
  useEffect(() => {
    // Gestion de la session
    if (session && Object.keys(user).length === 0) {
      fetchSession();
    }
  }, [session, user, fetchSession]);

  useEffect(() => {
    // Gestion des redirections
    if (session && pathname === '/') {
      redirect(URL_HOME);
    }
  }, [session, pathname]);

  useEffect(() => {
    // Gestion des autorisations
    if (user && 'role' in user && user.role !== 'ADMIN' && 
        (pathname === URL_DASHBOARD_MOVIE || 
         pathname.includes('edit-movie') || 
         pathname.includes('add-movie'))) {
      redirect(URL_HOME);
    }
  }, [user, pathname]);

  useEffect(() => {
    // Gestion de la déconnexion
    if (!session && 
        pathname !== '/' && 
        pathname !== URL_LEGAL_MENTIONS && 
        pathname !== URL_PRIVACY) {
      logoutSession();
    }
  }, [session, pathname]);

  return;
}

export default useAuthStatus