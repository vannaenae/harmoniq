import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Users, UserPlus, CalendarCheck } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ServiceSelect } from '@/components/ServiceSelect'
import { SubstitutionModal } from '@/pages/availability/SubstitutionModal'
import { useChoir } from '@/contexts/ChoirContext'
import { subscribeServices } from '@/lib/firestore'
import { subscribeAvailability } from '@/lib/availability'
import { availabilityMeta } from '@/lib/status'
import { downloadCsv, voicePartLabel } from '@/lib/utils'
import type { Service, Availability, AvailabilityStatus, ChoirMember } from '@/types'

export function AvailabilityOverview() {
  const { choir, members } = useChoir()
  const [services, setServices] = useState<Service[]>([])
  const [serviceId, setServiceId] = useState<string>('')
  const [availability, setAvailability] = useState<Record<string, Availability>>({})
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingAvail, setLoadingAvail] = useState(false)
  const [subMember, setSubMember] = useState<ChoirMember | null>(null)

  useEffect(() => {
    if (!choir) return
    const unsub = subscribeServices(choir.id, s => {
      setServices(s)
      setServiceId(prev => {
        if (prev) return prev
        const now = new Date()
        const next = s.find(x => x.date >= now) ?? s[s.length - 1]
        return next?.id ?? ''
      })
      setLoadingServices(false)
    })
    return unsub
  }, [choir])

  useEffect(() => {
    if (!choir || !serviceId) return
    setLoadingAvail(true)
    const unsub = subscribeAvailability(
      choir.id,
      serviceId,
      a => { setAvailability(a); setLoadingAvail(false) },
    )
    return unsub
  }, [choir, serviceId])

  const statusFor = (uid: string): AvailabilityStatus => availability[uid]?.status ?? 'no_response'

  const counts = useMemo(() => {
    const c: Record<AvailabilityStatus, number> = { available: 0, not_sure: 0, unavailable: 0, no_response: 0 }
    members.forEach(m => { c[statusFor(m.uid)]++ })
    return c
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, availability])

  const handleExport = () => {
    const svc = services.find(s => s.id === serviceId)
    downloadCsv(
      `availability-${svc?.title ?? 'service'}.csv`,
      ['Name', 'Voice part', 'Status', 'Note'],
      members.map(m => [
        m.preferredName || m.displayName,
        voicePartLabel[m.voicePart] ?? m.voicePart,
        availabilityMeta[statusFor(m.uid)].label,
        availability[m.uid]?.note ?? '',
      ]),
    )
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-3xl mx-auto md:px-8">
        <PageHeader
          title="Availability"
          subtitle="Who can make it"
          actions={
            <>
              <Link to="/attendance">
                <Button variant="outlined" size="sm"><CalendarCheck size={16} /> Attendance</Button>
              </Link>
              <Button variant="outlined" size="sm" onClick={handleExport} disabled={members.length === 0}>
                <Download size={16} /> Export CSV
              </Button>
            </>
          }
        />

        {loadingServices ? (
          <Skeleton className="h-11 w-full mb-5" />
        ) : services.length === 0 ? (
          <Card className="p-2">
            <EmptyState icon={Users} title="No services yet" description="Create a service first, then you can track availability." />
          </Card>
        ) : (
          <>
            <div className="mb-5">
              <ServiceSelect services={services} value={serviceId} onValueChange={setServiceId} />
            </div>

            {/* Summary counts */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {(['available', 'not_sure', 'unavailable', 'no_response'] as AvailabilityStatus[]).map(s => (
                <Card key={s} className="p-3 text-center">
                  <p className="text-2xl font-bold" style={{ color: availabilityMeta[s].color }}>
                    {counts[s]}
                  </p>
                  <p className="text-[11px] text-harmonic-muted mt-0.5 leading-tight">
                    {availabilityMeta[s].label}
                  </p>
                </Card>
              ))}
            </div>

            {/* Member list */}
            {loadingAvail ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-card" />
                <Skeleton className="h-16 w-full rounded-card" />
              </div>
            ) : members.length === 0 ? (
              <Card className="p-2">
                <EmptyState
                  icon={UserPlus}
                  title="Your choir is ready"
                  description="Share your invite link to bring the team in."
                />
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {members.map(m => {
                  const status = statusFor(m.uid)
                  const meta = availabilityMeta[status]
                  return (
                    <Card key={m.uid} className="p-4 flex items-center gap-3">
                      <Avatar src={m.photoURL} name={m.preferredName || m.displayName} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-harmonic-text truncate">
                          {m.preferredName || m.displayName}
                        </p>
                        <p className="text-xs text-harmonic-muted">
                          {voicePartLabel[m.voicePart] ?? m.voicePart}
                        </p>
                        {availability[m.uid]?.note && (
                          <p className="text-xs text-harmonic-muted italic mt-0.5 truncate">
                            "{availability[m.uid].note}"
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                        {status === 'unavailable' && (
                          <button
                            onClick={() => setSubMember(m)}
                            className="text-xs font-medium text-harmonic-primary hover:opacity-80"
                          >
                            Find a sub
                          </button>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {subMember && choir && (
        <SubstitutionModal
          open={!!subMember}
          onOpenChange={(o) => !o && setSubMember(null)}
          choirId={choir.id}
          serviceId={serviceId}
          unavailableMember={subMember}
          members={members}
          availability={availability}
        />
      )}
    </AppLayout>
  )
}
