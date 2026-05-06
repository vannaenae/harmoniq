import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { HarmoniqUser, UserRole } from '../types';

export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole
): Promise<HarmoniqUser> => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });

  const user: Omit<HarmoniqUser, 'createdAt' | 'updatedAt'> = {
    uid: cred.user.uid,
    email,
    displayName,
    role,
    choirIds: [],
  };

  await setDoc(doc(db, 'users', cred.user.uid), {
    ...user,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { ...user, createdAt: new Date(), updatedAt: new Date() };
};

export const loginUser = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

export const fetchUserDoc = async (uid: string): Promise<HarmoniqUser | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  } as HarmoniqUser;
};

export const subscribeAuth = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);
