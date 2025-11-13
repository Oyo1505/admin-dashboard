import { getFavoriteMovies } from '@/domains/dashboard/actions/movie';
import { signIn, signOut } from '@/lib/auth-client';
import { IUser as IUserModel } from '@/models/user/user';
import { URL_BASE, URL_HOME } from '@/shared/route';
import { redirect } from 'next/navigation';
import { create } from 'zustand';
import { PersistOptions, createJSONStorage, persist } from 'zustand/middleware';

interface IUser extends IUserModel {
  token?: string;
}

interface UserStore {
  user: IUser;
  connected: boolean;
  setUser: (user: IUser, connected: boolean) => void; // eslint-disable-line no-unused-vars
  fetchUser: (email: string) => Promise<void>; // eslint-disable-line no-unused-vars
  logout: () => void;
  login: () => void;
}

const persistOptions: PersistOptions<UserStore> = {
  name: 'user',
  storage: createJSONStorage(() => sessionStorage),
};

export const signInGoole = async () => {
  const data = await signIn.social({
    provider: 'google',
    callbackURL: URL_HOME,
  });
  return data;
};

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: {},
      connected: false,
      setUser: (user: IUser, connected: boolean) => set({ user, connected }),
      fetchUser: async (email: string) => {
        const response = await fetch(`/api/users/get-user-connected/${email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        const data = await response.json();
        const { user } = data;
        const { movies } = user?.id
          ? await getFavoriteMovies(user?.id)
          : { movies: [] };
        set({ user: { ...user, favoriteMovies: movies }, connected: true });
      },
      login: async () => {
        await signInGoole();
        set({ connected: true });
      },
      logout: async () => {
        await signOut();
        set({ user: {}, connected: false });
        redirect(URL_BASE);
      },
    }),
    persistOptions
  )
);

export default useUserStore;
