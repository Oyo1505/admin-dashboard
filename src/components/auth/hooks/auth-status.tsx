'use client'
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useEffect } from 'react'
import useUserStore from "store/user/user-store"

const useAuthStatus = async () => {
  const {user, fetchUser, connected, setUser} = useUserStore((state) => state)
  const pathname = usePathname()
  const {  data: session } = useSession({
    required: true,
    onUnauthenticated() {
      // The user is not authenticated, handle it here.
    },
  })

  useEffect(() => {
    const fetchSession = async () => {
      try {
        session && session?.user?.email &&  await fetchUser(session?.user?.email);  
      } catch (error) {
        console.log(error)
      }
    };
    if (connected && Object.keys(user).length === 0) fetchSession();
   else if (!session && pathname !== '/') setUser({}, false);
  }, [fetchUser, session, connected, user, setUser, pathname]);

  return;
}

export default useAuthStatus