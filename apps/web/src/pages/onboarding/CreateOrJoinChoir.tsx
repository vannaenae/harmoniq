import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { PlusCircle, LogIn, Upload, Loader2 } from 'lucide-react'
import { db, storage } from '@harmoniq/shared'
import { useAuth } from '@harmoniq/shared'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { generateInviteCode, generateId, cn } from '@harmoniq/shared'

/* API_POINT: Firebase Storage — choir logo upload */
/* API_POINT: Firestore — choir creation and invite code lookup */

export function CreateOrJoinChoir() {
  const { firebaseUser, harmonicUser, refreshUser } = useAuth()
  const navigate = useNavigate()
  const isDirector = harmonicUser?.role === 'director'

  // Director: Create choir
  const [choirName, setChoirName] = useState('')
  const [churchName, setChurchName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Member: Join choir
  const [inviteCode, setInviteCode] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleCreateChoir = async () => {
    if (!choirName.trim() || !firebaseUser) return
    setError(null)
    setSaving(true)
    try {
      const choirId = generateId()
      let logoURL: string | undefined

      if (logoFile) {
        const fileRef = storageRef(storage, `choirs/${choirId}/logo`)
        await uploadBytes(fileRef, logoFile)
        logoURL = await getDownloadURL(fileRef)
      }

      const inviteCode = generateInviteCode()
      const inviteExpiry = new Date()
      inviteExpiry.setDate(inviteExpiry.getDate() + 7)

      // Create choir document
      await setDoc(doc(db, 'choirs', choirId), {
        id: choirId,
        name: choirName.trim(),
        churchName: churchName.trim() || null,
        logoURL: logoURL ?? null,
        inviteCode,
        inviteExpiry,
        ownerId: firebaseUser.uid,
        memberCount: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Add creator as member
      await setDoc(doc(db, 'choirs', choirId, 'members', firebaseUser.uid), {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName ?? '',
        email: firebaseUser.email ?? '',
        photoURL: firebaseUser.photoURL ?? null,
        role: 'director',
        voicePart: 'unclassified',
        joinedAt: serverTimestamp(),
      })

      // Update user doc
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        choirId,
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      })

      await refreshUser()
      navigate('/dashboard')
    } catch (err) {
      console.error('Create choir error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleJoinChoir = async () => {
    const code = inviteCode.trim().toUpperCase()
    if (!code || !firebaseUser) return
    setError(null)
    setSaving(true)
    try {
      const choisSnap = await getDocs(
        query(collection(db, 'choirs'), where('inviteCode', '==', code))
      )

      if (choisSnap.empty) {
        setError("That invite code doesn't match any choir. Double-check and try again.")
        setSaving(false)
        return
      }

      const choirDoc = choisSnap.docs[0]
      const choirId = choirDoc.id
      const choirData = choirDoc.data()

      // Check invite hasn't expired
      const expiry = choirData.inviteExpiry?.toDate?.() ?? new Date(0)
      if (expiry < new Date()) {
        setError('This invite link has expired. Ask your director for a new one.')
        setSaving(false)
        return
      }

      // Add member
      await setDoc(doc(db, 'choirs', choirId, 'members', firebaseUser.uid), {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName ?? '',
        email: firebaseUser.email ?? '',
        photoURL: firebaseUser.photoURL ?? null,
        role: 'member',
        voicePart: 'unclassified',
        joinedAt: serverTimestamp(),
      })

      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        choirId,
        updatedAt: serverTimestamp(),
      })

      await refreshUser()
      navigate('/onboarding/voice-part')
    } catch (err) {
      console.error('Join choir error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-harmonic-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex flex-col gap-8">

        <div className="text-center">
          <span className="text-sm font-medium text-harmonic-secondary uppercase tracking-widest">
            Step 2 of {isDirector ? '2' : '3'}
          </span>
          <h1 className="text-2xl font-bold text-harmonic-text mt-2">
            {isDirector ? 'Set up your choir' : 'Join a choir'}
          </h1>
          <p className="text-harmonic-muted text-sm mt-1">
            {isDirector
              ? 'Create a workspace for your team.'
              : 'Your director should have sent you an invite link or code.'}
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger">
            {error}
          </div>
        )}

        {isDirector ? (
          /* ── Director: create choir ── */
          <div className="bg-white rounded-card-lg p-6 shadow-card flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <PlusCircle size={18} className="text-harmonic-primary" aria-hidden="true" />
              <span className="text-sm font-semibold text-harmonic-text">Create a new choir</span>
            </div>

            <Input
              label="Choir name"
              placeholder="e.g. Grace Chapel Choir"
              value={choirName}
              onChange={e => setChoirName(e.target.value)}
              required
            />

            <Input
              label="Church name"
              placeholder="e.g. Grace Chapel Church (optional)"
              value={churchName}
              onChange={e => setChurchName(e.target.value)}
            />

            {/* Logo upload */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-harmonic-text">Choir logo (optional)</span>
              <div className="flex items-center gap-3">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Choir logo preview"
                    className="w-14 h-14 rounded-full object-cover border-2 border-harmonic-border"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-harmonic-surface border-2 border-dashed border-harmonic-border flex items-center justify-center">
                    <Upload size={18} className="text-harmonic-muted" aria-hidden="true" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-harmonic-primary hover:opacity-80 transition-opacity underline"
                  aria-label="Upload choir logo"
                >
                  {logoPreview ? 'Change photo' : 'Upload photo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                  aria-hidden="true"
                />
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleCreateChoir}
              disabled={!choirName.trim() || saving}
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Creating your choir…' : 'Create choir'}
            </Button>
          </div>
        ) : (
          /* ── Member: join choir ── */
          <div className="bg-white rounded-card-lg p-6 shadow-card flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <LogIn size={18} className="text-harmonic-primary" aria-hidden="true" />
              <span className="text-sm font-semibold text-harmonic-text">Join a choir</span>
            </div>

            <Input
              label="Invite code"
              placeholder="e.g. ABC123"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="tracking-widest text-center font-mono text-lg uppercase"
            />

            <p className="text-xs text-harmonic-muted text-center">
              Your director can share an invite link or code from the Members screen.
            </p>

            <Button
              variant="primary"
              fullWidth
              onClick={handleJoinChoir}
              disabled={inviteCode.trim().length < 6 || saving}
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Joining…' : 'Join choir'}
            </Button>
          </div>
        )}

        {/* Divider + switch path */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-harmonic-border" />
          <span className="text-xs text-harmonic-muted font-medium">or</span>
          <div className="flex-1 h-px bg-harmonic-border" />
        </div>

        <p className={cn('text-center text-sm text-harmonic-muted')}>
          {isDirector ? (
            <>
              Joining someone else's choir?{' '}
              <button
                onClick={async () => {
                  if (!firebaseUser) return
                  await updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'member', updatedAt: serverTimestamp() })
                  await refreshUser()
                }}
                className="text-harmonic-primary font-medium underline hover:opacity-80"
              >
                Switch to Member
              </button>
            </>
          ) : (
            <>
              Starting a new choir?{' '}
              <button
                onClick={async () => {
                  if (!firebaseUser) return
                  await updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'director', updatedAt: serverTimestamp() })
                  await refreshUser()
                }}
                className="text-harmonic-primary font-medium underline hover:opacity-80"
              >
                Switch to Director
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
