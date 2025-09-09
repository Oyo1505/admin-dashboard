import { getUserConnected } from '@/domains/auth/actions/action.users';
import { getFavoriteMovies } from '@/domains/dashboard/actions/movie';
import { User } from '@/models/user/user';
import { URL_BASE, URL_HOME } from '@/shared/route';
import { signIn, signOut } from 'next-auth/react';
import { create } from 'zustand';
import { PersistOptions, createJSONStorage, persist } from 'zustand/middleware';

interface IUser extends User {
  token?: string;
}

interface UserStore {
  user: IUser;
  connected: boolean;
  setUser: (user: IUser, connected: boolean) => void;
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
      setUser: (user: IUser, connected: boolean) => set({ user, connected }),
      fetchUser: async (email: string) => {
        const { user } = await getUserConnected(email);
        const { movies } = user?.id
          ? await getFavoriteMovies(user?.id)
          : { movies: [] };
        set({ user: { ...user, favoriteMovies: movies }, connected: true });
      },
      login: async () => {
        await signIn('google', { callbackUrl: URL_HOME });
        set({ connected: true });
      },
      logout: async () => {
        set({ user: { id: '' }, connected: false });
        await signOut({ callbackUrl: URL_BASE });
      },
    }),
    persistOptions
  )
);

export default useUserStore;
