import { useEffect, useState } from 'react'
import { CalendarCheck, Users } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ServiceSelect } from '@/components/ServiceSelect'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { subscribeServices } from '@/lib/firestore'
import { subscribeAvailability } from '@/lib/availability'
import {
  subscribeAttendance,
  setAttendance,
  isAttendanceLocked,
  defaultFromAvailability,
} from '@/lib/attendance'
import { voicePartLabel, cn } from '@/lib/utils'
import type { Service, AttendanceStatus } from '@/types'

export function AttendanceTracker() {
  const { firebaseUser } = useAuth()
  const { choir, members } = useChoir()
  const [services, setServices] = useState<Service[]>([])
  const [serviceId, setServiceId] = useState('')
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [loadingServices, setLoadingServices] = useState(true)
  const [loading, setLoading] = useState(false)

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
  const presentCount = Object.values(statuses).filter(s => s === 'present').length

  const toggle = async (uid: string) => {
    if (!choir || !firebaseUser || locked) return
    const next: AttendanceStatus = statuses[uid] === 'present' ? 'absent' : 'present'
    setStatuses(prev => ({ ...prev, [uid]: next }))
    try {
      await setAttendance(choir.id, serviceId, uid, next, firebaseUser.uid)
    } catch (err) {
      console.error('Save attendance error:', err)
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
                  const present = statuses[m.uid] === 'present'
                  return (
                    <Card key={m.uid} className="p-4 flex items-center gap-3">
                      <Avatar src={m.photoURL} name={m.preferredName || m.displayName} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-harmonic-text truncate">
                          {m.preferredName || m.displayName}
                        </p>
                        <p className="text-xs text-harmonic-muted">{voicePartLabel[m.voicePart] ?? m.voicePart}</p>
                      </div>
                      {/* Present/Absent toggle */}
                      <button
                        role="switch"
                        aria-checked={present}
                        aria-label={`Mark ${m.preferredName || m.displayName} ${present ? 'absent' : 'present'}`}
                        disabled={locked}
                        onClick={() => toggle(m.uid)}
                        className={cn(
                          'px-4 py-2 rounded-pill text-sm font-medium transition-colors min-h-[40px] min-w-[88px]',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          present
                            ? 'bg-harmonic-success text-white'
                            : 'bg-harmonic-surface text-harmonic-muted',
                        )}
                      >
                        {present ? 'Present' : 'Absent'}
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
