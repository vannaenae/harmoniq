import { create } from 'zustand';
import { SetList } from '../types';

interface SetListState {
  setLists: SetList[];
  selectedSetList: SetList | null;
  isLoading: boolean;
  setSetLists: (setLists: SetList[]) => void;
  setSelectedSetList: (sl: SetList | null) => void;
  setLoading: (v: boolean) => void;
  addSetList: (sl: SetList) => void;
  updateSetList: (id: string, data: Partial<SetList>) => void;
  removeSetList: (id: string) => void;
}

export const useSetListStore = create<SetListState>((set) => ({
  setLists: [],
  selectedSetList: null,
  isLoading: false,
  setSetLists: (setLists) => set({ setLists }),
  setSelectedSetList: (selectedSetList) => set({ selectedSetList }),
  setLoading: (isLoading) => set({ isLoading }),
  addSetList: (sl) => set((s) => ({ setLists: [sl, ...s.setLists] })),
  updateSetList: (id, data) =>
    set((s) => ({ setLists: s.setLists.map((sl) => (sl.id === id ? { ...sl, ...data } : sl)) })),
  removeSetList: (id) => set((s) => ({ setLists: s.setLists.filter((sl) => sl.id !== id) })),
}));
