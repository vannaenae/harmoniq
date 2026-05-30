import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

/* API_POINT: Firebase — fill VITE_FIREBASE_* vars in .env with your project config */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)

// Persistent IndexedDB cache so revisited pages render instantly from local
// data while Firestore revalidates in the background. Falls back to the
// default in-memory cache if IndexedDB is unavailable (private browsing,
// storage quota exceeded, or a double-init from HMR).
function buildFirestore() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  } catch {
    return getFirestore(app)
  }
}
export const db = buildFirestore()

export const storage   = getStorage(app)
export const functions = getFunctions(app)
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({ prompt: 'select_account' })

/* API_POINT: Google Calendar — request calendar scopes so the OAuth access token
   returned at sign-in can create events via the createCalendarEvent function. */
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events')
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly')

export default app
