import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Music2, Play, ChevronRight, CalendarClock, CheckCircle2, Users } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { getService, getSetList } from '@/lib/firestore'
import { getMyAvailability } from '@/lib/availability'
import { formatDate } from '@/lib/utils'
import type { Service, SetListItem, AvailabilityStatus } from '@/types'

const availBadgeTone: Partial<Record<AvailabilityStatus, 'success' | 'warning' | 'danger'>> = {
  available: 'success',
  unavailable: 'danger',
  not_sure: 'warning',
}
const availLabel: Partial<Record<AvailabilityStatus, string>> = {
  available: 'Going',
  unavailable: 'Not going',
  not_sure: 'Not sure',
}

export function SetListDetail() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const { choir, members, isDirector } = useChoir()
  const [service, setService] = useState<Service | null>(null)
  const [items, setItems] = useState<SetListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [myAvailStatus, setMyAvailStatus] = useState<AvailabilityStatus | null>(null)

  useEffect(() => {
    if (!choir || !serviceId) return
    let active = true
    setLoading(true)
    Promise.all([getService(choir.id, serviceId), getSetList(choir.id, serviceId)])
      .then(([svc, list]) => { if (active) { setService(svc); setItems(list) } })
      .catch(err => console.error('Load set list error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir, serviceId])

  useEffect(() => {
    if (!choir || !serviceId || !firebaseUser || isDirector) return
    let active = true
    getMyAvailability(choir.id, serviceId, firebaseUser.uid)
      .then(avail => { if (active) setMyAvailStatus(avail?.status ?? null) })
      .catch(() => {})
    return () => { active = false }
  }, [choir, serviceId, firebaseUser, isDirector])

  const nameFor = (uid?: string) => {
    if (!uid) return null
    const m = members.find(x => x.uid === uid)
    return m ? (m.preferredName || m.displayName) : null
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader
          title={service?.title ?? 'Set list'}
          subtitle={service ? `${formatDate(service.date)}${service.time ? ` · ${service.time}` : ''}` : undefined}
          back="/services"
          actions={
            isDirector ? (
              <div className="flex gap-2">
                <Link to={`/services/${serviceId}/roster`}>
                  <Button variant="outlined" size="sm">Roster</Button>
                </Link>
                <Link to={`/services/${serviceId}/setlist`}>
                  <Button variant="outlined" size="sm">Edit</Button>
                </Link>
              </div>
            ) : undefined
          }
        />

        {/* Availability prompt / status for members */}
        {!isDirector && (
          myAvailStatus ? (
            <Card className="p-4 mb-5 flex items-center gap-3 border-2 border-harmonic-border">
              <span className="w-10 h-10 rounded-full bg-harmonic-surface flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={18} className="text-harmonic-primary" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-harmonic-text">Availability recorded</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge tone={availBadgeTone[myAvailStatus] ?? 'muted'}>{availLabel[myAvailStatus] ?? myAvailStatus}</Badge>
                </div>
              </div>
              <Link to={`/services/${serviceId}/availability`}>
                <Button variant="outlined" size="sm">Change</Button>
              </Link>
            </Card>
          ) : (
            <Card className="p-4 mb-5 flex items-center gap-3 border-2 border-harmonic-warning/30">
              <span className="w-10 h-10 rounded-full bg-harmonic-warning/10 flex items-center justify-center flex-shrink-0">
                <CalendarClock size={18} className="text-harmonic-warning" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-harmonic-text">Can you make it?</p>
                <p className="text-xs text-harmonic-muted">Let your director know your availability.</p>
              </div>
              <Link to={`/services/${serviceId}/availability`}>
                <Button variant="primary" size="sm">Mark it</Button>
              </Link>
            </Card>
          )
        )}

        {/* Confirmed roster */}
        {service?.rosteredMemberIds && service.rosteredMemberIds.length > 0 && (
          <Card className="p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-harmonic-primary" aria-hidden="true" />
              <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">
                Roster ({service.rosteredMemberIds.length})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {service.rosteredMemberIds.map(uid => {
                const m = members.find(x => x.uid === uid)
                if (!m) return null
                const name = m.preferredName || m.displayName
                return (
                  <div key={uid} className="flex items-center gap-1.5 bg-harmonic-surface rounded-full pl-1 pr-3 py-1">
                    <Avatar src={m.photoURL} name={name} size="sm" />
                    <span className="text-xs font-medium text-harmonic-text">{name}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {service?.theme && (
          <Card className="p-4 mb-5">
            <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">Theme</p>
            <p className="text-sm text-harmonic-text mt-1">{service.theme}</p>
            {service.scriptureRef && (
              <p className="text-sm text-harmonic-muted mt-1 italic">{service.scriptureRef}</p>
            )}
          </Card>
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-card" />
            <Skeleton className="h-20 w-full rounded-card" />
            <Skeleton className="h-20 w-full rounded-card" />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-2">
            <EmptyState
              icon={Music2}
              title="No songs yet"
              description="The set list for this service hasn't been put together yet. Check back soon."
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, idx) => {
              const lead = nameFor(item.leadVocalist)
              return (
                <Link key={item.songId} to={`/services/${serviceId}/songs/${item.songId}`}>
                  <Card className="p-4 hover:shadow-card-hover transition-shadow">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-harmonic-surface flex items-center justify-center flex-shrink-0 text-sm font-semibold text-harmonic-primary">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-harmonic-text truncate">{item.title}</p>
                        <p className="text-xs text-harmonic-muted truncate">
                          {item.artist}
                          {item.key ? ` · Key of ${item.key}` : ''}
                        </p>
                        {lead && (
                          <p className="text-xs text-harmonic-secondary font-medium mt-0.5">
                            {lead} is leading
                          </p>
                        )}
                      </div>
                      {/* Spotify preview lives on the song detail (embed player) */}
                      <button
                        onClick={(e) => { e.preventDefault(); navigate(`/services/${serviceId}/songs/${item.songId}`) }}
                        aria-label={`Preview ${item.title} on Spotify`}
                        className="w-9 h-9 rounded-full bg-harmonic-surface flex items-center justify-center flex-shrink-0 hover:bg-harmonic-border transition-colors"
                      >
                        <Play size={15} className="text-harmonic-primary ml-0.5" aria-hidden="true" />
                      </button>
                      <ChevronRight size={16} className="text-harmonic-muted flex-shrink-0" aria-hidden="true" />
                    </div>
                    {item.notes && (
                      <p className="text-xs text-harmonic-muted mt-2 pl-11 leading-relaxed">{item.notes}</p>
                    )}
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
