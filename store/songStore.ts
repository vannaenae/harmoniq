import { create } from 'zustand';
import { Song } from '../types';

interface SongState {
  songs: Song[];
  selectedSong: Song | null;
  isLoading: boolean;
  setSongs: (songs: Song[]) => void;
  setSelectedSong: (song: Song | null) => void;
  setLoading: (v: boolean) => void;
  addSong: (song: Song) => void;
  updateSong: (id: string, data: Partial<Song>) => void;
  removeSong: (id: string) => void;
}

export const useSongStore = create<SongState>((set) => ({
  songs: [],
  selectedSong: null,
  isLoading: false,
  setSongs: (songs) => set({ songs }),
  setSelectedSong: (selectedSong) => set({ selectedSong }),
  setLoading: (isLoading) => set({ isLoading }),
  addSong: (song) => set((s) => ({ songs: [song, ...s.songs] })),
  updateSong: (id, data) =>
    set((s) => ({ songs: s.songs.map((song) => (song.id === id ? { ...song, ...data } : song)) })),
  removeSong: (id) => set((s) => ({ songs: s.songs.filter((song) => song.id !== id) })),
}));
