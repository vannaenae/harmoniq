import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp, type PartialWithFieldValue } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { HarmonicUser } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import type { VoicePart } from '@/types'

const VOICE_PARTS: { id: VoicePart; label: string; range: string }[] = [
  { id: 'soprano',      label: 'Soprano',      range: 'Higher female range' },
  { id: 'alto',         label: 'Alto',         range: 'Lower female range' },
  { id: 'tenor',        label: 'Tenor',        range: 'Higher male range' },
  { id: 'bass',         label: 'Bass',         range: 'Lower male range' },
  { id: 'unclassified', label: 'Not sure yet', range: 'We can figure it out together' },
]

export function VoicePart() {
  const { firebaseUser, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<VoicePart | null>(null)
  const [preferredName, setPreferredName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!selected || !firebaseUser) return
    setSaving(true)
    try {
      const updates: PartialWithFieldValue<HarmonicUser> = {
        voicePart: selected,
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      }
      if (preferredName.trim()) {
        updates.preferredName = preferredName.trim()
      }

      await updateDoc(doc(db, 'users', firebaseUser.uid), updates)

      const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
      const userData = userSnap.data() as HarmonicUser | undefined
      if (userData?.choirId) {
        await updateDoc(
          doc(db, 'choirs', userData.choirId, 'members', firebaseUser.uid),
          { voicePart: selected, updatedAt: serverTimestamp() }
        )
      }

      await refreshUser()
      navigate('/dashboard')
    } catch (err) {
      console.error('Voice part save error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-harmonic-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex flex-col gap-8">

        <div className="text-center">
          <span className="text-sm font-medium text-harmonic-secondary uppercase tracking-widest">
            Step 3 of 3
          </span>
          <h1 className="text-2xl font-bold text-harmonic-text mt-2">What's your voice part?</h1>
          <p className="text-harmonic-muted text-sm mt-1">
            Your director can always update this later.
          </p>
        </div>

        {/* Voice part selector */}
        <div className="flex flex-col gap-2">
          {VOICE_PARTS.map(({ id, label, range }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              aria-pressed={selected === id}
              aria-label={`${label} — ${range}`}
              className={cn(
                'w-full text-left px-4 py-3.5 rounded-card border-2 transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harmonic-primary',
                selected === id
                  ? 'border-harmonic-primary bg-harmonic-primary/5'
                  : 'border-harmonic-border bg-white hover:border-harmonic-primary/40',
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    'font-semibold text-sm',
                    selected === id ? 'text-harmonic-primary' : 'text-harmonic-text',
                  )}>
                    {label}
                  </p>
                  <p className="text-harmonic-muted text-xs mt-0.5">{range}</p>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                    selected === id
                      ? 'border-harmonic-primary bg-harmonic-primary'
                      : 'border-harmonic-border bg-white',
                  )}
                >
                  {selected === id && (
                    <div className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Optional preferred name */}
        <div className="bg-white rounded-card p-4 shadow-card">
          <Input
            label="Preferred display name (optional)"
            placeholder="e.g. Grace or Sister Grace"
            value={preferredName}
            onChange={e => setPreferredName(e.target.value)}
          />
          <p className="text-xs text-harmonic-muted mt-2">
            This is how you'll appear in the choir — your director will see this name.
          </p>
        </div>

        <Button
          variant="primary"
          fullWidth
          onClick={handleSave}
          disabled={!selected || saving}
        >
          {saving ? 'Saving…' : 'Save and continue'}
        </Button>
      </div>
    </div>
  )
}
