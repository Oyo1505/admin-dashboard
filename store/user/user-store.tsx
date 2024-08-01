

import { getUserConnected } from '@/components/auth/action/action';
import { URL_BASE, URL_HOME } from '@/shared/route';
import { User } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import { create } from 'zustand'
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware'


// Définir l'interface pour le store utilisateur
interface UserStore {
  user: User | {};
  connected:boolean
  setUser: (user: User) => void;
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
      setUser: (user: User) => set({ user }),
      fetchUser: async (email: string) => {
        const { user } = await getUserConnected(email);
        set({ user, connected: true });
      },
      login: async ()=> {
        await signIn('google', { callbackUrl: URL_HOME });
        
      },
      logout: async () =>{ 
        await signOut({ callbackUrl: URL_BASE});
        set({ user: {}, connected: false, })
      },
    }),
    persistOptions
  )
);

export default useUserStore