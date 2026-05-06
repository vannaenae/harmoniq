import { create } from 'zustand';
import { Choir, ChoirMember } from '../types';

interface ChoirState {
  choir: Choir | null;
  members: ChoirMember[];
  isLoading: boolean;
  setChoir: (choir: Choir | null) => void;
  setMembers: (members: ChoirMember[]) => void;
  setLoading: (v: boolean) => void;
}

export const useChoirStore = create<ChoirState>((set) => ({
  choir: null,
  members: [],
  isLoading: false,
  setChoir: (choir) => set({ choir }),
  setMembers: (members) => set({ members }),
  setLoading: (isLoading) => set({ isLoading }),
}));
