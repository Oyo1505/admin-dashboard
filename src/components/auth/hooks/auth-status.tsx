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

  useEffect(() => {
    const fetchSession = async () => {
      try {
        session && session?.user?.email &&  (await fetchUser(session?.user?.email));  
      } catch (error) {
        console.log(error)
      }
    };
    const logoutSession = async () => {
      try {
        setUser({ id: '' }, false)
        await logout()
      } catch (error) {
        console.log(error)
      }
    };
    if (session && Object.keys(user).length === 0)  fetchSession();
    else if(session && (pathname === '/')){redirect(URL_HOME)}
    else if(user && user.role !== 'ADMIN' && (pathname === URL_DASHBOARD_MOVIE || pathname.includes('edit-movie') || pathname.includes('add-movie'))){redirect(URL_HOME)}
    else if (!session && pathname !== '/' &&  pathname !== URL_LEGAL_MENTIONS &&  pathname !== URL_PRIVACY) {
    logoutSession()
   }
  }, [fetchUser, session, connected, user, setUser, pathname, logout]);

  return;
}

export default useAuthStatus