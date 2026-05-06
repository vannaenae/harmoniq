import {
  doc, setDoc, getDoc, updateDoc, collection,
  query, where, getDocs, onSnapshot, serverTimestamp, arrayUnion,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Choir, ChoirMember, UserRole } from '../types';
import { generateInviteCode } from '../lib/utils';

export const createChoir = async (
  ownerId: string,
  name: string,
  churchName?: string,
  defaultServiceDay?: string,
  defaultRehearsalDay?: string
): Promise<Choir> => {
  const id = doc(collection(db, 'choirs')).id;
  const inviteCode = generateInviteCode();

  const choir: Choir = {
    id, name, churchName, inviteCode, ownerId,
    defaultServiceDay, defaultRehearsalDay,
    memberCount: 1,
    createdAt: new Date(), updatedAt: new Date(),
  };

  await setDoc(doc(db, 'choirs', id), {
    ...choir,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Add owner as member
  await setDoc(doc(db, 'choirs', id, 'members', ownerId), {
    role: 'owner', vocalPart: 'unassigned', joinedAt: serverTimestamp(),
  });

  // Link choir to user
  await updateDoc(doc(db, 'users', ownerId), {
    choirId: id,
    choirIds: arrayUnion(id),
    updatedAt: serverTimestamp(),
  });

  return choir;
};

export const joinChoirByCode = async (userId: string, code: string): Promise<Choir> => {
  const q = query(collection(db, 'choirs'), where('inviteCode', '==', code.toUpperCase()));
  const snap = await getDocs(q);

  if (snap.empty) throw new Error('Invalid invite code');

  const choirDoc = snap.docs[0];
  const choir = { id: choirDoc.id, ...choirDoc.data() } as Choir;

  await setDoc(doc(db, 'choirs', choir.id, 'members', userId), {
    role: 'member', vocalPart: 'unassigned', joinedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'choirs', choir.id), {
    memberCount: choir.memberCount + 1,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'users', userId), {
    choirId: choir.id,
    choirIds: arrayUnion(choir.id),
    updatedAt: serverTimestamp(),
  });

  return choir;
};

export const getChoir = async (choirId: string): Promise<Choir | null> => {
  const snap = await getDoc(doc(db, 'choirs', choirId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    ...d,
    id: snap.id,
    createdAt: d.createdAt?.toDate?.() ?? new Date(),
    updatedAt: d.updatedAt?.toDate?.() ?? new Date(),
  } as Choir;
};

export const subscribeChoir = (
  choirId: string,
  cb: (choir: Choir) => void
) =>
  onSnapshot(doc(db, 'choirs', choirId), (snap) => {
    if (!snap.exists()) return;
    const d = snap.data();
    cb({
      ...d, id: snap.id,
      createdAt: d.createdAt?.toDate?.() ?? new Date(),
      updatedAt: d.updatedAt?.toDate?.() ?? new Date(),
    } as Choir);
  });

export const subscribeMembers = (
  choirId: string,
  cb: (members: ChoirMember[]) => void
) => {
  const q = query(collection(db, 'choirs', choirId, 'members'));
  return onSnapshot(q, async (snap) => {
    const members: ChoirMember[] = await Promise.all(
      snap.docs.map(async (memberDoc) => {
        const memberData = memberDoc.data();
        const userSnap = await getDoc(doc(db, 'users', memberDoc.id));
        const userData = userSnap.exists() ? userSnap.data() : {};
        return {
          uid: memberDoc.id,
          displayName: userData.displayName ?? 'Unknown',
          email: userData.email ?? '',
          photoURL: userData.photoURL,
          role: memberData.role ?? 'member',
          vocalPart: memberData.vocalPart ?? 'unassigned',
          joinedAt: memberData.joinedAt?.toDate?.() ?? new Date(),
        } as ChoirMember;
      })
    );
    cb(members);
  });
};

export const updateMemberRole = (choirId: string, userId: string, role: UserRole) =>
  updateDoc(doc(db, 'choirs', choirId, 'members', userId), { role });

export const regenerateInviteCode = async (choirId: string) => {
  const code = generateInviteCode();
  await updateDoc(doc(db, 'choirs', choirId), {
    inviteCode: code, updatedAt: serverTimestamp(),
  });
  return code;
};
