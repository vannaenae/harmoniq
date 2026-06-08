import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Plus, ChevronRight } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChoir } from '@/contexts/ChoirContext'
import { subscribeServices } from '@/lib/firestore'
import { formatDate } from '@/lib/utils'
import { serviceStatusMeta } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { Service } from '@/types'

type Filter = 'upcoming' | 'past' | 'draft'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'draft', label: 'Draft' },
]

const PAGE_SIZE = 20

export function ServicesList() {
  const { choir, isDirector } = useChoir()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('upcoming')
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    if (!choir) return
    setLoading(true)
    const unsub = subscribeServices(
      choir.id,
      s => { setServices(s); setLoading(false) },
      err => { console.error('Load services error:', err); setLoading(false) },
    )
    return unsub
  }, [choir])

  const now = new Date()
  const filtered = useMemo(() => {
    const visibleToUser = services.filter(s => isDirector || s.status === 'published')
    switch (filter) {
      case 'upcoming':
        return visibleToUser.filter(s => s.date >= now).sort((a, b) => +a.date - +b.date)
      case 'past':
        return visibleToUser.filter(s => s.date < now).sort((a, b) => +b.date - +a.date)
      case 'draft':
        return isDirector ? services.filter(s => s.status === 'draft') : []
      default:
        return visibleToUser
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, filter, isDirector])

  const page = filtered.slice(0, visible)

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-3xl mx-auto md:px-8">
        <PageHeader
          title="Services"
          subtitle={choir?.name}
          actions={
            isDirector ? (
              <Link to="/services/new">
                <Button variant="primary" size="sm">
                  <Plus size={16} /> New service
                </Button>
              </Link>
            ) : undefined
          }
        />

        {/* Filters */}
        <div className="flex gap-2 mb-5" role="tablist" aria-label="Filter services">
          {FILTERS.filter(f => f.id !== 'draft' || isDirector).map(f => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => { setFilter(f.id); setVisible(PAGE_SIZE) }}
              className={cn(
                'px-4 py-2 rounded-pill text-sm font-semibold transition-all duration-200 min-h-[40px]',
                filter === f.id
                  ? 'bg-gradient-brand text-white shadow-nav-active'
                  : 'bg-harmonic-surface text-harmonic-muted hover:text-harmonic-text hover:bg-harmonic-border/40',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : page.length === 0 ? (
          <Card className="p-2">
            <EmptyState
              icon={CalendarDays}
              title="Nothing scheduled yet"
              description={
                isDirector
                  ? 'Create your first service to get started.'
                  : 'Your director hasn\'t published any services yet. Check back soon.'
              }
              action={
                isDirector ? (
                  <Link to="/services/new">
                    <Button variant="primary" size="sm"><Plus size={16} /> Create a service</Button>
                  </Link>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {page.map(s => (
                <Link key={s.id} to={isDirector ? `/services/${s.id}/setlist` : `/services/${s.id}`}>
                  <Card className="p-4 flex items-center gap-4 group" hoverable>
                    <span className="w-10 h-10 rounded-xl bg-gradient-card-accent border border-harmonic-primary/15 flex items-center justify-center flex-shrink-0">
                      <CalendarDays size={17} className="text-harmonic-primary" aria-hidden="true" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-harmonic-text truncate group-hover:text-harmonic-primary transition-colors">{s.title}</p>
                      <p className="text-harmonic-muted text-xs mt-0.5">
                        {formatDate(s.date)}{s.time ? ` · ${s.time}` : ''}
                      </p>
                    </div>
                    <Badge tone={serviceStatusMeta[s.status].tone}>
                      {serviceStatusMeta[s.status].label}
                    </Badge>
                    <ChevronRight size={15} className="text-harmonic-muted group-hover:translate-x-0.5 group-hover:text-harmonic-primary transition-all flex-shrink-0" aria-hidden="true" />
                  </Card>
                </Link>
              ))}
            </div>

            {visible < filtered.length && (
              <div className="flex justify-center mt-5">
                <Button variant="outlined" size="sm" onClick={() => setVisible(v => v + PAGE_SIZE)}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
