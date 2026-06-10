import { useEffect, useState } from 'react'
import { CalendarCheck, Users } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ServiceSelect } from '@/components/ServiceSelect'
import { useAuth } from '@harmoniq/shared'
import { useChoir } from '@harmoniq/shared'
import { subscribeServices } from '@harmoniq/shared'
import { subscribeAvailability } from '@harmoniq/shared'
import {
  subscribeAttendance,
  setAttendance,
  isAttendanceLocked,
  defaultFromAvailability,
} from '@harmoniq/shared'
import { voicePartLabel, cn } from '@harmoniq/shared'
import type { Service, AttendanceStatus } from '@harmoniq/shared'

export function AttendanceTracker() {
  const { firebaseUser } = useAuth()
  const { choir, members } = useChoir()
  const [services, setServices] = useState<Service[]>([])
  const [serviceId, setServiceId] = useState('')
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [loadingServices, setLoadingServices] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!choir) return
    const unsub = subscribeServices(choir.id, s => {
      const past = s.filter(x => x.date < new Date()).sort((a, b) => +b.date - +a.date)
      const list = past.length ? past : s
      setServices(list)
      setServiceId(prev => prev || (list[0]?.id ?? ''))
      setLoadingServices(false)
    })
    return unsub
  }, [choir])

  // Real-time attendance + availability, pre-populating from availability where no record exists
  useEffect(() => {
    if (!choir || !serviceId) return
    setLoading(true)
    let att: Record<string, { status: AttendanceStatus }> = {}
    let avail: Record<string, { status?: string }> = {}
    let gotAtt = false
    let gotAvail = false

    const merge = () => {
      if (!gotAtt || !gotAvail) return
      const next: Record<string, AttendanceStatus> = {}
      members.forEach(m => {
        next[m.uid] = att[m.uid]?.status ?? defaultFromAvailability(avail[m.uid]?.status)
      })
      setStatuses(next)
      setLoading(false)
    }

    const unsubAtt = subscribeAttendance(choir.id, serviceId, a => {
      att = a; gotAtt = true; merge()
    })
    const unsubAvail = subscribeAvailability(choir.id, serviceId, a => {
      avail = a; gotAvail = true; merge()
    })
    return () => { unsubAtt(); unsubAvail() }
  }, [choir, serviceId, members])

  const service = services.find(s => s.id === serviceId)
  const locked = service ? isAttendanceLocked(service.date) : false
  const presentCount = Object.values(statuses).filter(s => s === 'present' || s === 'late').length

  const cycle = async (uid: string) => {
    if (!choir || !firebaseUser || locked) return
    const prev_status = statuses[uid]
    const next: AttendanceStatus =
      prev_status === 'present' ? 'late' :
      prev_status === 'late' ? 'absent' : 'present'
    setStatuses(prev => ({ ...prev, [uid]: next }))
    setSaveError(null)
    try {
      await setAttendance(choir.id, serviceId, uid, next, firebaseUser.uid)
    } catch (err) {
      console.error('Save attendance error:', err)
      setStatuses(prev => ({ ...prev, [uid]: prev_status }))
      setSaveError('Failed to save. Please try again.')
    }
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-3xl mx-auto md:px-8">
        <PageHeader title="Attendance" subtitle="Mark who showed up" />

        {loadingServices ? (
          <Skeleton className="h-11 w-full mb-5" />
        ) : services.length === 0 ? (
          <Card className="p-2">
            <EmptyState icon={CalendarCheck} title="No services yet" description="Once you've held a service, track attendance here." />
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <ServiceSelect services={services} value={serviceId} onValueChange={setServiceId} />
            </div>

            {/* Summary */}
            <Card className="p-4 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-harmonic-primary" aria-hidden="true" />
                <span className="text-sm font-medium text-harmonic-text">
                  {presentCount} present of {members.length}
                </span>
              </div>
              {locked && <span className="text-xs text-harmonic-muted">Locked</span>}
            </Card>

            {locked && (
              <div role="alert" className="bg-harmonic-surface rounded-xl px-4 py-3 text-sm text-harmonic-muted mb-5">
                This service was more than 24 hours ago, so attendance is locked.
              </div>
            )}

            {saveError && (
              <p role="alert" className="text-sm text-harmonic-danger mb-4">{saveError}</p>
            )}

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-card" />
                <Skeleton className="h-16 w-full rounded-card" />
              </div>
            ) : members.length === 0 ? (
              <Card className="p-2">
                <EmptyState icon={Users} title="Your choir is ready" description="Share your invite link to bring the team in." />
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {members.map(m => {
                  const status = statuses[m.uid]
                  const name = m.preferredName || m.displayName
                  return (
                    <Card key={m.uid} className="p-4 flex items-center gap-3">
                      <Avatar src={m.photoURL} name={name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-harmonic-text truncate">{name}</p>
                        <p className="text-xs text-harmonic-muted">{voicePartLabel[m.voicePart] ?? m.voicePart}</p>
                      </div>
                      {/* Present / Late / Absent cycle */}
                      <button
                        aria-label={`Cycle attendance for ${name} (currently ${status ?? 'absent'})`}
                        disabled={locked}
                        onClick={() => cycle(m.uid)}
                        className={cn(
                          'px-4 py-2 rounded-pill text-sm font-medium transition-colors min-h-[40px] min-w-[88px]',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          status === 'present'
                            ? 'bg-harmonic-success text-white'
                            : status === 'late'
                              ? 'bg-harmonic-warning text-white'
                              : 'bg-harmonic-surface text-harmonic-muted',
                        )}
                      >
                        {status === 'present' ? 'Present' : status === 'late' ? 'Late' : 'Absent'}
                      </button>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
