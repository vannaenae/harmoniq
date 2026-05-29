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
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

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

  /* API_POINT: Firebase Auth — Google Sign-In popup */
  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    /* API_POINT: Google Calendar — stash the OAuth access token (calendar scopes)
       so service publishing can create calendar events this session. */
    const credential = GoogleAuthProvider.credentialFromResult(result)
    if (credential?.accessToken) {
      sessionStorage.setItem('harmonic_google_token', credential.accessToken)
    }

    // Create user doc on first sign-in
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

  const signOut = async () => {
    await firebaseSignOut(auth)
    setHarmonicUser(null)
    setFirebaseUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, harmonicUser, loading, signInWithGoogle, signOut, refreshUser }}
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
