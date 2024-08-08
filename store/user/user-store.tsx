

import { getUserConnected } from '@/components/auth/action/action';
import { URL_BASE, URL_HOME } from '@/shared/route';
import { User } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import { create } from 'zustand'
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware'


// Définir l'interface pour le store utilisateur

interface IUser extends User {
  role? : 'ADMIN' | 'USER'
}

interface UserStore {
  user: IUser;
  connected:boolean
  setUser: (user: User, connected: boolean) => void;
  fetchUser: (email: string) => Promise<void>;
  logout: () => void;
  login: () => void;
}

// Définir les options de persistance
const persistOptions: PersistOptions<UserStore> = {
  name: 'user',
  storage: createJSONStorage(() => sessionStorage),
};

// Implémenter le store utilisateur en utilisant zustand et persist
const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: {},
      connected: false,
      setUser: (user: User, connected: boolean) => set({ user, connected }),
      fetchUser: async (email: string) => {
        const {user} = await getUserConnected(email);
        set({  user: user, connected: true });
      },
      login: async ()=> {
        await signIn('google', { callbackUrl: URL_HOME });
        set({ connected: true });
      },
      logout: async () =>{ 
        set({ user: {}, connected: false, })
        await signOut({ callbackUrl: URL_BASE});
      },
    }),
    persistOptions
  )
);

export default useUserStore