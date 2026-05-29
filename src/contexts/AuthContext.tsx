import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase'
import type { HarmonicUser } from '@/types'

interface AuthContextValue {
  firebaseUser: User | null
  harmonicUser: HarmonicUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function createUserDoc(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? '',
      onboardingComplete: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [harmonicUser, setHarmonicUser] = useState<HarmonicUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchHarmonicUser = async (uid: string): Promise<HarmonicUser | null> => {
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) return null
    return snap.data() as HarmonicUser
  }

  const refreshUser = async () => {
    if (!firebaseUser) return
    const u = await fetchHarmonicUser(firebaseUser.uid)
    setHarmonicUser(u)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        const u = await fetchHarmonicUser(user.uid)
        setHarmonicUser(u)
      } else {
        setHarmonicUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    const credential = GoogleAuthProvider.credentialFromResult(result)
    if (credential?.accessToken) {
      sessionStorage.setItem('harmonic_google_token', credential.accessToken)
    }
    await createUserDoc(user)
    // Force-fetch after doc creation — onAuthStateChanged may have already fired
    // before the doc existed, leaving harmonicUser null and causing a sign-in loop.
    const u = await fetchHarmonicUser(user.uid)
    setFirebaseUser(user)
    setHarmonicUser(u)
  }

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const u = await fetchHarmonicUser(result.user.uid)
    setHarmonicUser(u)
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })
    await sendEmailVerification(result.user)
    await createUserDoc(result.user)
    const u = await fetchHarmonicUser(result.user.uid)
    setFirebaseUser(result.user)
    setHarmonicUser(u)
  }

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setHarmonicUser(null)
    setFirebaseUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        harmonicUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
