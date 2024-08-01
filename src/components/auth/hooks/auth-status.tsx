'use client'
import { useSession } from "next-auth/react"
import { useEffect } from 'react'
import useUserStore from "store/user/user-store"


const useAuthStatus = () => {
  const {user, fetchUser} = useUserStore((state) => state)
  const {  data: session } = useSession({
    required: true,
    onUnauthenticated() {
      // The user is not authenticated, handle it here.
    },
  })

  useEffect(() => {
    const fetchSession = async () => {
      if (session && session?.user?.email && Object.keys(user).length === 0) {
       await fetchUser(session?.user?.email);
      }
    };

    fetchSession();
  }, [fetchUser, session, user]);

  return;
}

export default useAuthStatus