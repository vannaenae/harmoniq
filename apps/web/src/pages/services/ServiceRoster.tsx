import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, HelpCircle, Users } from 'lucide-react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@harmoniq/shared'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChoir } from '@harmoniq/shared'
import { getService } from '@harmoniq/shared'
import { getServiceAvailability } from '@harmoniq/shared'
import { broadcastNotification } from '@harmoniq/shared'
import { voicePartLabel } from '@harmoniq/shared'
import { availabilityMeta } from '@harmoniq/shared'
import type { Service, AvailabilityStatus } from '@harmoniq/shared'

const STATUS_ORDER: AvailabilityStatus[] = ['available', 'not_sure', 'unavailable', 'no_response']

export function ServiceRoster() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const navigate = useNavigate()
  const { choir, members, isDirector } = useChoir()

  const [service, setService] = useState<Service | null>(null)
  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>({})
  const [rostered, setRostered] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!choir || !serviceId) return
    let active = true
    Promise.all([
      getService(choir.id, serviceId),
      getServiceAvailability(choir.id, serviceId),
    ]).then(([svc, avail]) => {
      if (!active) return
      setService(svc)
      const statusMap: Record<string, AvailabilityStatus> = {}
      Object.entries(avail).forEach(([uid, a]) => { statusMap[uid] = a.status })
      setAvailability(statusMap)
      if (svc?.rosteredMemberIds) setRostered(new Set(svc.rosteredMemberIds))
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir, serviceId])

  const toggleMember = (uid: string) => {
    setRostered(prev => {
      const next = new Set(prev)
      if (next.has(uid)) next.delete(uid)
      else next.add(uid)
      return next
    })
  }

  const handleConfirm = async () => {
    if (!choir || !serviceId || !service) return
    setSaving(true)
    try {
      const ids = [...rostered]
      await updateDoc(doc(db, 'choirs', choir.id, 'services', serviceId), {
        rosteredMemberIds: ids,
        updatedAt: serverTimestamp(),
      })

      // Notify rostered members
      const rosteredMembers = members.filter(m => rostered.has(m.uid))
      if (rosteredMembers.length > 0) {
        await broadcastNotification(
          choir.id,
          rosteredMembers.map(m => m.uid),
          'service_update',
          `You're rostered for ${service.title}`,
          `You've been confirmed for ${service.title} on ${service.date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}.`,
          `/services/${serviceId}`,
        )
      }

      navigate(`/services/${serviceId}`)
    } catch (err) {
      console.error('Roster save error:', err)
      setSaving(false)
    }
  }

  const sortedMembers = [...members].sort((a, b) => {
    const aStatus = availability[a.uid] ?? 'no_response'
    const bStatus = availability[b.uid] ?? 'no_response'
    return STATUS_ORDER.indexOf(aStatus) - STATUS_ORDER.indexOf(bStatus)
  })

  if (!isDirector) {
    return (
      <AppLayout>
        <div className="px-6 py-8 max-w-2xl mx-auto">
          <PageHeader title="Roster" back={`/services/${serviceId}`} />
          <Card className="p-6">
            <EmptyState icon={Users} title="Directors only" description="Only directors can manage the roster." />
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader
          title="Build roster"
          subtitle={service?.title}
          back={`/services/${serviceId}`}
        />

        {loading ? (
          <Card className="p-6 space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </Card>
        ) : members.length === 0 ? (
          <Card className="p-6">
            <EmptyState icon={Users} title="No members yet" description="Invite members to your choir first." />
          </Card>
        ) : (
          <>
            <p className="text-sm text-harmonic-muted mb-4">
              Select who will sing/play at this service. Members are sorted by availability.
            </p>

            <div className="flex flex-col gap-2 mb-6">
              {sortedMembers.map(m => {
                const status = availability[m.uid] ?? 'no_response'
                const meta = availabilityMeta[status]
                const isRostered = rostered.has(m.uid)

                return (
                  <button
                    key={m.uid}
                    onClick={() => toggleMember(m.uid)}
                    aria-pressed={isRostered}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      isRostered
                        ? 'border-harmonic-primary bg-harmonic-primary/5'
                        : 'border-harmonic-border bg-white hover:border-harmonic-primary/30'
                    }`}
                  >
                    <Avatar src={m.photoURL} name={m.preferredName || m.displayName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-harmonic-text truncate">
                        {m.preferredName || m.displayName}
                      </p>
                      <p className="text-xs text-harmonic-muted">
                        {voicePartLabel[m.voicePart] ?? m.voicePart}
                      </p>
                    </div>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <AvailabilityIcon status={status} />
                    {isRostered && (
                      <CheckCircle2 size={18} className="text-harmonic-primary flex-shrink-0" aria-hidden="true" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between mb-6 bg-harmonic-surface rounded-2xl px-4 py-3">
              <span className="text-sm text-harmonic-text font-medium">
                {rostered.size} member{rostered.size !== 1 ? 's' : ''} rostered
              </span>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => {
                  const availableIds = members
                    .filter(m => (availability[m.uid] ?? 'no_response') === 'available')
                    .map(m => m.uid)
                  setRostered(new Set(availableIds))
                }}
              >
                Select all available
              </Button>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirm}
              disabled={saving || rostered.size === 0}
            >
              {saving ? 'Confirming…' : `Confirm roster (${rostered.size})`}
            </Button>
          </>
        )}
      </div>
    </AppLayout>
  )
}

function AvailabilityIcon({ status }: { status: AvailabilityStatus }) {
  if (status === 'available') return <CheckCircle2 size={16} className="text-harmonic-success flex-shrink-0" aria-hidden="true" />
  if (status === 'unavailable') return <XCircle size={16} className="text-harmonic-danger flex-shrink-0" aria-hidden="true" />
  if (status === 'not_sure') return <HelpCircle size={16} className="text-harmonic-warning flex-shrink-0" aria-hidden="true" />
  return null
}
