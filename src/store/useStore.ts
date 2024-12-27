import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'masjid_admin';
  related_masjid?: string;
}

interface Masjid {
  id: string;
  name: string;
  type: string;
  madhab: string;
  locale: string;
  website?: string;
  has_times: boolean;
  active: boolean;
}

interface AppState {
  user: User | null;
  masjid: Masjid | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setMasjid: (masjid: Masjid | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  masjid: null,
  isAuthenticated: false,
};

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setUser: (user) => set({ user }),
        setMasjid: (masjid) => set({ masjid }),
        setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
        reset: () => set(initialState),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          user: state.user,
          masjid: state.masjid,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// Selector hooks for better performance
export const useUser = () => useStore((state) => state.user);
export const useMasjid = () => useStore((state) => state.masjid);
export const useIsAuthenticated = () => useStore((state) => state.isAuthenticated); 