'use client'
import { useSession } from "next-auth/react"
import { useEffect } from 'react'
import useUserStore from "store/user/user-store"


const useAuthStatus = async () => {
  const {user, fetchUser, connected} = useUserStore((state) => state)
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
  }, [fetchUser, session, connected, user]);

  return;
}

export default useAuthStatus