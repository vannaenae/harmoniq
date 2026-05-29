import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

const PENDING_KEY = 'harmonic_pending_invite'

/** Handles an invite link: /join/:code
 *  - Not signed in → stash the code, send to sign-in
 *  - Signed in → validate the code, join the choir, continue onboarding */
export function JoinChoir() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { firebaseUser, loading, refreshUser } = useAuth()
  const [status, setStatus] = useState<'working' | 'error'>('working')
  const [message, setMessage] = useState('Joining your choir…')

  useEffect(() => {
    if (loading || !code) return

    if (!firebaseUser) {
      localStorage.setItem(PENDING_KEY, code)
      navigate('/sign-in', { replace: true })
      return
    }

    let active = true
    ;(async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'choirs'), where('inviteCode', '==', code.toUpperCase())),
        )
        if (snap.empty) {
          if (active) { setStatus('error'); setMessage("That invite link doesn't match any choir.") }
          return
        }
        const choirDoc = snap.docs[0]
        const choirData = choirDoc.data()
        const expiry = choirData.inviteExpiry?.toDate?.() ?? new Date(0)
        if (expiry < new Date()) {
          if (active) { setStatus('error'); setMessage('This invite link has expired. Ask your director for a new one.') }
          return
        }

        await setDoc(doc(db, 'choirs', choirDoc.id, 'members', firebaseUser.uid), {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName ?? '',
          email: firebaseUser.email ?? '',
          photoURL: firebaseUser.photoURL ?? null,
          role: 'member',
          voicePart: 'unclassified',
          joinedAt: serverTimestamp(),
        })
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          role: 'member',
          choirId: choirDoc.id,
          updatedAt: serverTimestamp(),
        })
        localStorage.removeItem(PENDING_KEY)
        await refreshUser()
        // New members still pick a voice part
        navigate('/onboarding/voice-part', { replace: true })
      } catch (err) {
        console.error('Join error:', err)
        if (active) { setStatus('error'); setMessage('Something went wrong joining the choir.') }
      }
    })()
    return () => { active = false }
  }, [code, firebaseUser, loading, navigate, refreshUser])

  return (
    <div className="min-h-screen bg-harmonic-background flex items-center justify-center px-6">
      <div className="text-center">
        {status === 'working' ? (
          <>
            <div
              className="w-12 h-12 rounded-xl animate-pulse mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #18005F 0%, #560056 100%)' }}
              aria-hidden="true"
            />
            <p className="text-sm text-harmonic-muted">{message}</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-harmonic-text mb-2">Hmm.</p>
            <p className="text-sm text-harmonic-muted mb-5 max-w-xs">{message}</p>
            <Button variant="primary" onClick={() => navigate('/dashboard', { replace: true })}>
              Go to dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export { PENDING_KEY }
