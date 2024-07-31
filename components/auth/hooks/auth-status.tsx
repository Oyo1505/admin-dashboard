'use client'
import { useSession } from "next-auth/react"
import useUserStore from '@/store/user/user-store'
import { useEffect } from 'react'


const useAuthStatus = () => {
  const {user, fetch, removeUser} = useUserStore((state) => state)
  const {  data: session } = useSession({
    required: true,
    onUnauthenticated() {
      // The user is not authenticated, handle it here.
    },
  })

  useEffect(() => {
    const fetchSession = async () => {
      if (session && session?.user?.email && Object.keys(user).length === 0) {
       await fetch(session?.user?.email);
      }
    
    };

    fetchSession();
  }, [fetch, session, user, removeUser]);

  return;
}

export default useAuthStatus