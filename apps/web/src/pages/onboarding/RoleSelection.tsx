import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Mic2, Music2, Loader2 } from 'lucide-react'
import { db } from '@harmoniq/shared'
import { useAuth } from '@harmoniq/shared'
import { Button } from '@/components/ui/Button'
import { cn } from '@harmoniq/shared'
import type { UserRole } from '@harmoniq/shared'

const roles: { id: UserRole; title: string; description: string; icon: typeof Mic2 }[] = [
  {
    id: 'director',
    title: "I'm a Director",
    description: 'I build set lists, manage the team, and coordinate services.',
    icon: Mic2,
  },
  {
    id: 'member',
    title: "I'm a Member",
    description: 'I sing or play in the choir and mark my availability for services.',
    icon: Music2,
  },
]

export function RoleSelection() {
  const { firebaseUser, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<UserRole | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    if (!selected || !firebaseUser) return
    setError(null)
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        role: selected,
        updatedAt: serverTimestamp(),
      })
      await refreshUser()
      navigate('/onboarding/choir')
    } catch (err) {
      console.error('Role save error:', err)
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
            Step 1 of {selected === 'member' ? '3' : '2'}
          </span>
          <h1 className="text-2xl font-bold text-harmonic-text mt-2">
            What's your role?
          </h1>
          <p className="text-harmonic-muted text-sm mt-1">
            This helps us set up the right experience for you.
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {roles.map(({ id, title, description, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              aria-pressed={selected === id}
              aria-label={title}
              className={cn(
                'w-full text-left p-5 rounded-card border-2 transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harmonic-primary',
                'flex items-start gap-4',
                selected === id
                  ? 'border-harmonic-primary bg-harmonic-primary/5'
                  : 'border-harmonic-border bg-white hover:border-harmonic-primary/40',
              )}
            >
              <div
                className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                  selected === id ? 'bg-harmonic-primary text-white' : 'bg-harmonic-surface text-harmonic-muted',
                )}
              >
                <Icon size={20} aria-hidden="true" />
              </div>
              <div>
                <p className={cn('font-semibold text-sm', selected === id ? 'text-harmonic-primary' : 'text-harmonic-text')}>
                  {title}
                </p>
                <p className="text-harmonic-muted text-xs mt-0.5 leading-relaxed">{description}</p>
              </div>
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          fullWidth
          onClick={handleContinue}
          disabled={!selected || saving}
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Saving…' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
