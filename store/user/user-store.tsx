


import { getUserConnected } from '@/domains/auth/action/action';
import { getFavoriteMovies } from '@/domains/dashboard/action';
import { User } from '@/models/user/user';
import { URL_BASE, URL_HOME } from '@/shared/route';
import { signIn, signOut } from 'next-auth/react';
import { create } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

interface IUser extends User {
  token?: string;
}

interface UserStore {
  user: IUser;
  connected:boolean
  setUser: (user: User, connected: boolean) => void;
  fetchUser: (email: string) => Promise<void>;
  logout: () => void;
  login: () => void;
}


const persistOptions: PersistOptions<UserStore> = {
  name: 'user',
  storage: createJSONStorage(() => sessionStorage),
};


const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: {},
      connected: false,
      setUser: (user: User, connected: boolean) => set({ user, connected }),
      fetchUser: async (email: string) => {
        const { user } = await getUserConnected(email);
        const {movies} = user?.id ? await getFavoriteMovies(user?.id) : { movies: [] };
        set({ user: { ...user, favoriteMovies: movies }, connected: true });
      },
      login: async ()=> {
        await signIn('google', { callbackUrl: URL_HOME });
        set({ connected: true });
      },
      logout: async () =>{ 
        set({ user: { id: '' }, connected: false, })
        await signOut({ callbackUrl: URL_BASE});
      },
    }),
    persistOptions
  )
);

export default useUserStore