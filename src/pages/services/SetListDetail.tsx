import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Music2, Play, ChevronRight, CalendarClock } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChoir } from '@/contexts/ChoirContext'
import { getService, getSetList } from '@/lib/firestore'
import { formatDate } from '@/lib/utils'
import type { Service, SetListItem } from '@/types'

export function SetListDetail() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const { choir, members, isDirector } = useChoir()
  const [service, setService] = useState<Service | null>(null)
  const [items, setItems] = useState<SetListItem[]>([])
  const [loading, setLoading] = useState(true)

  /* API_POINT: Firestore — has the current member marked availability for this service?
     Wired in Phase 3. Defaulting to "not marked" so the prompt shows. */
  const [availabilityMarked] = useState(false)

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
              <Link to={`/services/${serviceId}/setlist`}>
                <Button variant="outlined" size="sm">Edit</Button>
              </Link>
            ) : undefined
          }
        />

        {/* Availability prompt for members */}
        {!isDirector && !availabilityMarked && (
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
                      {/* API_POINT: Spotify — 30s preview play (Phase 4) */}
                      <button
                        onClick={(e) => { e.preventDefault(); console.info('[stub] Spotify preview', item.title) }}
                        aria-label={`Preview ${item.title}`}
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
