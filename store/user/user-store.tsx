import { getUserConnected } from '@/components/auth/action/action'
import { User } from 'next-auth';
import { create } from 'zustand'
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware'


// Définir l'interface pour le store utilisateur
interface UserStore {
  user: User | {};
  setUser: (user: User) => void;
  fetch: (email: string) => Promise<void>;
  removeUser: () => void;
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
      setUser: (user: User) => set({ user }),
      fetch: async (email: string) => {
        const { user } = await getUserConnected(email);
        set({ user });
      },
      removeUser: () => set({ user: {} }),
    }),
    persistOptions
  )
);

export default useUserStore