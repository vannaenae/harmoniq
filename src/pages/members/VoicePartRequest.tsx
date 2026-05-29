import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { createVoicePartRequest } from '@/lib/members'
import { createNotification } from '@/lib/notifications'
import { voicePartLabel, cn } from '@/lib/utils'
import type { VoicePart } from '@/types'

const PARTS: VoicePart[] = [
  'soprano', 'alto', 'tenor', 'bass', 'unclassified',
  'keys', 'guitar', 'bass_guitar', 'drums', 'other_instrument',
]

export function VoicePartRequest() {
  const navigate = useNavigate()
  const { firebaseUser, harmonicUser } = useAuth()
  const { choir, members } = useChoir()

  const me = members.find(m => m.uid === firebaseUser?.uid)
  const currentPart = me?.voicePart ?? harmonicUser?.voicePart ?? 'unclassified'

  const [requested, setRequested] = useState<VoicePart | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!choir || !firebaseUser || !requested) return
    setSaving(true)
    try {
      const displayName = harmonicUser?.preferredName || harmonicUser?.displayName || 'A member'
      await createVoicePartRequest(choir.id, firebaseUser.uid, displayName, currentPart, requested, note.trim() || undefined)

      /* API_POINT: Notifications — notify the choir's director(s) of the pending request. */
      const directors = members.filter(m => m.role === 'director')
      await Promise.all(
        directors.map(d =>
          createNotification(
            choir.id,
            d.uid,
            'system',
            'Voice part change request',
            `${displayName} asked to move from ${voicePartLabel[currentPart]} to ${voicePartLabel[requested]}.`,
            `/members/${firebaseUser.uid}`,
          ),
        ),
      )
      setDone(true)
      setTimeout(() => navigate('/profile'), 1500)
    } catch (err) {
      console.error('Voice part request error:', err)
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-md mx-auto md:px-8">
        <PageHeader title="Request a voice part change" back="/profile" />

        {done ? (
          <Card className="p-8 flex flex-col items-center text-center gap-3">
            <CheckCircle2 size={48} className="text-harmonic-success" aria-hidden="true" />
            <p className="font-semibold text-harmonic-text">Request sent</p>
            <p className="text-sm text-harmonic-muted">Your director will review it and follow up.</p>
          </Card>
        ) : (
          <>
            <Card className="p-4 mb-5">
              <p className="text-xs text-harmonic-muted uppercase tracking-widest font-semibold">Current voice part</p>
              <p className="text-sm font-medium text-harmonic-text mt-1">{voicePartLabel[currentPart]}</p>
            </Card>

            <p className="text-sm font-medium text-harmonic-text mb-3">Which part would you like to move to?</p>
            <div className="flex flex-col gap-2 mb-5">
              {PARTS.filter(p => p !== currentPart).map(p => (
                <button
                  key={p}
                  onClick={() => setRequested(p)}
                  aria-pressed={requested === p}
                  className={cn(
                    'px-4 py-3.5 rounded-card border-2 text-left text-sm font-medium transition-all min-h-[52px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harmonic-primary',
                    requested === p
                      ? 'border-harmonic-primary bg-harmonic-primary/5 text-harmonic-primary'
                      : 'border-harmonic-border bg-white text-harmonic-text hover:border-harmonic-primary/40',
                  )}
                >
                  {voicePartLabel[p]}
                </button>
              ))}
            </div>

            <Textarea
              label="Note to your director (optional)"
              placeholder="e.g. I've been more comfortable singing alto lately"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="mb-5"
            />

            <Button variant="primary" fullWidth onClick={handleSubmit} disabled={!requested || saving}>
              {saving ? 'Sending…' : 'Send request'}
            </Button>
          </>
        )}
      </div>
    </AppLayout>
  )
}
