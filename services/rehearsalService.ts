import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, where, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RehearsalEvent } from '../types';

const eventsCol = (choirId: string) => collection(db, 'choirs', choirId, 'events');

function toEvent(id: string, data: Record<string, any>): RehearsalEvent {
  return {
    ...data,
    id,
    startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime ?? Date.now()),
    endTime:   data.endTime   instanceof Timestamp ? data.endTime.toDate()   : new Date(data.endTime   ?? Date.now()),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt ?? Date.now()),
  } as RehearsalEvent;
}

export const subscribeEvents = (choirId: string, cb: (events: RehearsalEvent[]) => void) => {
  const q = query(eventsCol(choirId), orderBy('startTime', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => toEvent(d.id, d.data())));
  });
};

export const subscribeUpcomingEvents = (choirId: string, cb: (events: RehearsalEvent[]) => void) => {
  const now = new Date();
  const q = query(
    eventsCol(choirId),
    where('startTime', '>=', now),
    orderBy('startTime', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => toEvent(d.id, d.data())));
  });
};

export const createEvent = async (
  choirId: string,
  data: Omit<RehearsalEvent, 'id' | 'createdAt'>,
): Promise<string> => {
  const ref = await addDoc(eventsCol(choirId), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateEvent = (choirId: string, eventId: string, data: Partial<RehearsalEvent>) =>
  updateDoc(doc(eventsCol(choirId), eventId), data);

export const deleteEvent = (choirId: string, eventId: string) =>
  deleteDoc(doc(eventsCol(choirId), eventId));
