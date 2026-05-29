import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, HelpCircle, X, CheckCircle2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { getService } from '@/lib/firestore'
import { getMyAvailability, setAvailability, isAvailabilityLocked } from '@/lib/availability'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Service, AvailabilityStatus } from '@/types'

const OPTIONS: { status: AvailabilityStatus; label: string; icon: typeof Check; color: string; ring: string }[] = [
  { status: 'available',   label: "I'm available",   icon: Check,      color: 'text-harmonic-success', ring: 'border-harmonic-success bg-harmonic-success/5' },
  { status: 'not_sure',    label: "I'm not sure",    icon: HelpCircle, color: 'text-harmonic-warning', ring: 'border-harmonic-warning bg-harmonic-warning/5' },
  { status: 'unavailable', label: "I can't make it", icon: X,          color: 'text-harmonic-danger',  ring: 'border-harmonic-danger bg-harmonic-danger/5' },
]

export function MarkAvailability() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const { choir } = useChoir()

  const [service, setService] = useState<Service | null>(null)
  const [selected, setSelected] = useState<AvailabilityStatus | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!choir || !serviceId || !firebaseUser) return
    let active = true
    setLoading(true)
    Promise.all([
      getService(choir.id, serviceId),
      getMyAvailability(choir.id, serviceId, firebaseUser.uid),
    ])
      .then(([svc, mine]) => {
        if (!active) return
        setService(svc)
        if (mine) { setSelected(mine.status); setNote(mine.note ?? '') }
      })
      .catch(err => console.error('Load availability error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir, serviceId, firebaseUser])

  const locked = service ? isAvailabilityLocked(service.date) : false

  const handleSave = async () => {
    if (!choir || !serviceId || !firebaseUser || !selected) return
    setSaving(true)
    try {
      await setAvailability(choir.id, serviceId, firebaseUser.uid, selected, note.trim() || undefined)
      /* API_POINT: Notifications — if status is 'unavailable', the Director's
         substitution flow is offered (Phase 3) and a notification may be raised. */
      setConfirmed(true)
      setTimeout(() => navigate(`/services/${serviceId}`), 1400)
    } catch (err) {
      console.error('Save availability error:', err)
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-md mx-auto md:px-8">
        <PageHeader title="Your availability" back={`/services/${serviceId}`} />

        {loading ? (
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </Card>
        ) : confirmed ? (
          <Card className="p-8 flex flex-col items-center text-center gap-3">
            <CheckCircle2 size={48} className="text-harmonic-success" aria-hidden="true" />
            <p className="font-semibold text-harmonic-text">Thanks — you're all set!</p>
            <p className="text-sm text-harmonic-muted">Your director can see your response now.</p>
          </Card>
        ) : (
          <>
            <Card className="p-5 mb-5">
              <p className="font-semibold text-harmonic-text">{service?.title}</p>
              <p className="text-sm text-harmonic-muted mt-0.5">
                {service && formatDate(service.date)}{service?.time ? ` · ${service.time}` : ''}
              </p>
            </Card>

            {locked && (
              <div role="alert" className="bg-harmonic-surface rounded-xl px-4 py-3 text-sm text-harmonic-muted mb-5">
                This service is within 24 hours, so responses are locked. Reach out to your director directly if anything's changed.
              </div>
            )}

            <div className="flex flex-col gap-3 mb-5">
              {OPTIONS.map(({ status, label, icon: Icon, color, ring }) => (
                <button
                  key={status}
                  disabled={locked}
                  onClick={() => setSelected(status)}
                  aria-pressed={selected === status}
                  aria-label={label}
                  className={cn(
                    'flex items-center gap-4 p-5 rounded-card border-2 transition-all text-left min-h-[64px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harmonic-primary',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    selected === status ? ring : 'border-harmonic-border bg-white hover:border-harmonic-muted/40',
                  )}
                >
                  <span className={cn('flex-shrink-0', color)}>
                    <Icon size={26} aria-hidden="true" />
                  </span>
                  <span className="font-semibold text-harmonic-text">{label}</span>
                </button>
              ))}
            </div>

            <Textarea
              label="Any notes for the director? (optional)"
              placeholder="e.g. I can come but I'll be 10 minutes late"
              value={note}
              onChange={e => setNote(e.target.value)}
              disabled={locked}
              className="mb-5"
            />

            <Button variant="primary" fullWidth onClick={handleSave} disabled={!selected || saving || locked}>
              {saving ? 'Saving…' : 'Save my response'}
            </Button>
          </>
        )}
      </div>
    </AppLayout>
  )
}
