import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Song } from '../types';

const songsCol = (choirId: string) => collection(db, 'choirs', choirId, 'songs');

export const subscribeSongs = (choirId: string, cb: (songs: Song[]) => void) => {
  const q = query(songsCol(choirId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const songs = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      } as Song;
    });
    cb(songs);
  });
};

export const addSong = async (choirId: string, data: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song> => {
  const ref = doc(songsCol(choirId));
  const song: Song = {
    ...data,
    id: ref.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await setDoc(ref, { ...song, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return song;
};

export const updateSong = (choirId: string, songId: string, data: Partial<Song>) =>
  updateDoc(doc(songsCol(choirId), songId), { ...data, updatedAt: serverTimestamp() });

export const deleteSong = (choirId: string, songId: string) =>
  deleteDoc(doc(songsCol(choirId), songId));
