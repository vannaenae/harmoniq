import { create } from 'zustand';
import { HarmoniqUser } from '../types';

interface AuthState {
  user: HarmoniqUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: HarmoniqUser | null) => void;
  setLoading: (v: boolean) => void;
  setInitialized: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
}));
