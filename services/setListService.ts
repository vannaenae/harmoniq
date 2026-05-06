import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SetList } from '../types';

const col = (choirId: string) => collection(db, 'choirs', choirId, 'setlists');

export const subscribeSetLists = (choirId: string, cb: (sl: SetList[]) => void) => {
  const q = query(col(choirId), orderBy('serviceDate', 'desc'));
  return onSnapshot(q, (snap) => {
    const lists = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        serviceDate: data.serviceDate?.toDate?.() ?? new Date(),
        createdAt:   data.createdAt?.toDate?.()   ?? new Date(),
        updatedAt:   data.updatedAt?.toDate?.()   ?? new Date(),
      } as SetList;
    });
    cb(lists);
  });
};

export const createSetList = async (
  choirId: string,
  data: Omit<SetList, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SetList> => {
  const ref = doc(col(choirId));
  const sl: SetList = { ...data, id: ref.id, createdAt: new Date(), updatedAt: new Date() };
  await setDoc(ref, { ...sl, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return sl;
};

export const updateSetList = (choirId: string, id: string, data: Partial<SetList>) =>
  updateDoc(doc(col(choirId), id), { ...data, updatedAt: serverTimestamp() });

export const deleteSetList = (choirId: string, id: string) =>
  deleteDoc(doc(col(choirId), id));
