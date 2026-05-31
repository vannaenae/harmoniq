import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp, type PartialWithFieldValue } from 'firebase/firestore'
import { Mic2, Music4, Loader2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import type { HarmonicUser, VoicePart } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

type Category = 'vocalist' | 'instrumentalist'

const VOCALISTS: { id: VoicePart; label: string; range: string }[] = [
  { id: 'soprano',      label: 'Soprano',      range: 'Higher female range' },
  { id: 'alto',         label: 'Alto',         range: 'Lower female range' },
  { id: 'tenor',        label: 'Tenor',        range: 'Higher male range' },
  { id: 'bass',         label: 'Bass',         range: 'Lower male range' },
  { id: 'unclassified', label: 'Not sure yet', range: "We'll figure it out together" },
]

const INSTRUMENTS: { id: VoicePart; label: string; description: string }[] = [
  { id: 'keys',             label: 'Keys / Piano',    description: 'Keyboard, piano, synth' },
  { id: 'guitar',           label: 'Guitar',          description: 'Acoustic, electric, or lead' },
  { id: 'bass_guitar',      label: 'Bass Guitar',     description: 'Electric or upright bass' },
  { id: 'drums',            label: 'Drums',           description: 'Drum kit or percussion' },
  { id: 'other_instrument', label: 'Other',           description: 'Violin, horn, cajon, etc.' },
]

function OptionButton({
  selected, onClick, label, sub,
}: { selected: boolean; onClick: () => void; label: string; sub: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'w-full text-left px-4 py-3.5 rounded-card border-2 transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harmonic-primary',
        selected
          ? 'border-harmonic-primary bg-harmonic-primary/5'
          : 'border-harmonic-border bg-white hover:border-harmonic-primary/40',
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={cn('font-semibold text-sm', selected ? 'text-harmonic-primary' : 'text-harmonic-text')}>
            {label}
          </p>
          <p className="text-harmonic-muted text-xs mt-0.5">{sub}</p>
        </div>
        <div className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
          selected ? 'border-harmonic-primary bg-harmonic-primary' : 'border-harmonic-border bg-white',
        )}>
          {selected && <div className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />}
        </div>
      </div>
    </button>
  )
}

export function VoicePart() {
  const { firebaseUser, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category | null>(null)
  const [selected, setSelected] = useState<VoicePart | null>(null)
  const [preferredName, setPreferredName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCategorySelect = (c: Category) => {
    setCategory(c)
    setSelected(null)
  }

  const handleSave = async () => {
    if (!selected || !firebaseUser) return
    setError(null)
    setSaving(true)
    try {
      const updates: PartialWithFieldValue<HarmonicUser> = {
        voicePart: selected,
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      }
      if (preferredName.trim()) updates.preferredName = preferredName.trim()

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
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-harmonic-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">

        <div className="text-center">
          <span className="text-sm font-medium text-harmonic-secondary uppercase tracking-widest">
            Step 3 of 3
          </span>
          <h1 className="text-2xl font-bold text-harmonic-text mt-2">What's your role?</h1>
          <p className="text-harmonic-muted text-sm mt-1">
            Your director can always update this later.
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger">
            {error}
          </div>
        )}

        {/* Category selector */}
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: 'vocalist' as Category, label: 'Vocalist', icon: Mic2 },
            { id: 'instrumentalist' as Category, label: 'Instrumentalist', icon: Music4 },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleCategorySelect(id)}
              aria-pressed={category === id}
              className={cn(
                'flex flex-col items-center gap-2 py-5 rounded-card border-2 transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harmonic-primary',
                category === id
                  ? 'border-harmonic-primary bg-harmonic-primary/5'
                  : 'border-harmonic-border bg-white hover:border-harmonic-primary/40',
              )}
            >
              <Icon size={28} className={category === id ? 'text-harmonic-primary' : 'text-harmonic-muted'} />
              <p className={cn('font-semibold text-sm', category === id ? 'text-harmonic-primary' : 'text-harmonic-text')}>
                {label}
              </p>
            </button>
          ))}
        </div>

        {/* Sub-options */}
        {category === 'vocalist' && (
          <div className="flex flex-col gap-2">
            {VOCALISTS.map(({ id, label, range }) => (
              <OptionButton
                key={id}
                selected={selected === id}
                onClick={() => setSelected(id)}
                label={label}
                sub={range}
              />
            ))}
          </div>
        )}

        {category === 'instrumentalist' && (
          <div className="flex flex-col gap-2">
            {INSTRUMENTS.map(({ id, label, description }) => (
              <OptionButton
                key={id}
                selected={selected === id}
                onClick={() => setSelected(id)}
                label={label}
                sub={description}
              />
            ))}
          </div>
        )}

        {/* Optional preferred name */}
        {category && (
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
        )}

        <Button
          variant="primary"
          fullWidth
          onClick={handleSave}
          disabled={!selected || saving}
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save and continue'}
        </Button>
      </div>
    </div>
  )
}
