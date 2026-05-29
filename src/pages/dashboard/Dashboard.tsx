import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Users,
  Megaphone,
  Music2,
  Plus,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { listServices } from '@/lib/firestore'
import { formatDate } from '@/lib/utils'
import { serviceStatusMeta } from '@/lib/status'
import type { Service } from '@/types'

export function Dashboard() {
  const { harmonicUser, firebaseUser } = useAuth()
  const { choir, isDirector } = useChoir()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const name =
    harmonicUser?.preferredName ?? harmonicUser?.displayName ?? firebaseUser?.displayName ?? 'there'

  useEffect(() => {
    if (!choir) return
    let active = true
    setLoading(true)
    listServices(choir.id)
      .then(s => { if (active) setServices(s) })
      .catch(err => console.error('Load services error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir])

  const now = new Date()
  const upcoming = services
    .filter(s => s.date >= now && (s.status === 'published' || isDirector))
    .slice(0, 3)
  const nextService = upcoming[0]

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-3xl mx-auto md:px-8">
        {/* Greeting */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-harmonic-text">Hey, {name.split(' ')[0]} 👋</h1>
          <p className="text-harmonic-muted text-sm mt-0.5">
            {isDirector
              ? "Here's what's happening with your choir."
              : "Here's what's coming up for your choir."}
          </p>
        </header>

        {/* Next service */}
        <section aria-labelledby="next-service-heading" className="mb-6">
          <h2
            id="next-service-heading"
            className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3"
          >
            Next service
          </h2>

          {loading ? (
            <SkeletonCard />
          ) : nextService ? (
            <NextServiceCard service={nextService} isDirector={isDirector} />
          ) : (
            <Card className="p-6">
              <EmptyState
                icon={CalendarDays}
                title="Nothing scheduled yet"
                description={
                  isDirector
                    ? 'Create your first service to get started.'
                    : "Your director hasn't scheduled anything yet. Check back soon."
                }
                action={
                  isDirector ? (
                    <Link to="/services/new">
                      <Button variant="primary" size="sm">
                        <Plus size={16} /> Create a service
                      </Button>
                    </Link>
                  ) : undefined
                }
              />
            </Card>
          )}
        </section>

        {/* Quick actions — Director only */}
        {isDirector && (
          <section aria-labelledby="quick-actions-heading" className="mb-6">
            <h2
              id="quick-actions-heading"
              className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3"
            >
              Quick actions
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Create set list', icon: Music2, to: '/services/new' },
                { label: 'Post announcement', icon: Megaphone, to: '/announcements/new' },
                { label: 'View members', icon: Users, to: '/members' },
              ].map(({ label, icon: Icon, to }) => (
                <Link
                  key={to}
                  to={to}
                  aria-label={label}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-card shadow-card hover:shadow-card-hover transition-shadow text-center min-h-[44px]"
                >
                  <span className="w-10 h-10 rounded-full bg-harmonic-surface flex items-center justify-center">
                    <Icon size={18} className="text-harmonic-primary" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-medium text-harmonic-text leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Member: song of the week (optional pinned) */}
        {!isDirector && (
          <section aria-labelledby="sotw-heading" className="mb-6">
            <h2
              id="sotw-heading"
              className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3"
            >
              Song of the week
            </h2>
            <Card className="p-4 flex items-center gap-4">
              <span
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #18005F 0%, #560056 100%)' }}
                aria-hidden="true"
              >
                <Sparkles size={20} className="text-white" />
              </span>
              <div className="min-w-0">
                {/* API_POINT: Firestore — pinned song of the week (mock for now) */}
                <p className="font-semibold text-sm text-harmonic-text truncate">Way Maker</p>
                <p className="text-xs text-harmonic-muted">Sinach · Key of E</p>
              </div>
            </Card>
          </section>
        )}

        {/* Upcoming services */}
        <section aria-labelledby="upcoming-heading" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="upcoming-heading"
              className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest"
            >
              Upcoming services
            </h2>
            <Link
              to="/services"
              className="text-xs font-medium text-harmonic-primary hover:opacity-80"
            >
              See all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : upcoming.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcoming.map(s => (
                <Link key={s.id} to={isDirector ? `/services/${s.id}/setlist` : `/services/${s.id}`}>
                  <Card className="p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-harmonic-text truncate">{s.title}</p>
                      <p className="text-harmonic-muted text-xs mt-0.5">{formatDate(s.date)}</p>
                    </div>
                    <Badge tone={serviceStatusMeta[s.status].tone}>
                      {serviceStatusMeta[s.status].label}
                    </Badge>
                    <ChevronRight size={16} className="text-harmonic-muted flex-shrink-0" aria-hidden="true" />
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-6">
              <p className="text-sm text-harmonic-muted text-center">
                No upcoming services on the calendar.
              </p>
            </Card>
          )}
        </section>

        {/* Recent activity (Director) / Latest announcement (Member) */}
        <section aria-labelledby="activity-heading">
          <h2
            id="activity-heading"
            className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3"
          >
            {isDirector ? 'Recent activity' : 'Latest announcement'}
          </h2>
          <Card className="p-4">
            {/* API_POINT: Firestore — activity feed / announcements wired in Phase 5 */}
            <p className="font-semibold text-sm text-harmonic-text">Welcome to Harmonic 🎵</p>
            <p className="text-harmonic-muted text-xs mt-1 leading-relaxed">
              {isDirector
                ? 'Activity from your team will show up here once things get going.'
                : 'Messages from your director will appear here.'}
            </p>
          </Card>
        </section>
      </div>
    </AppLayout>
  )
}

function NextServiceCard({ service, isDirector }: { service: Service; isDirector: boolean }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <span
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #18005F 0%, #560056 100%)' }}
          aria-hidden="true"
        >
          <CalendarDays size={22} className="text-white" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-harmonic-text text-sm">{service.title}</p>
          <p className="text-harmonic-muted text-xs mt-0.5">
            {formatDate(service.date)}
            {service.time ? ` · ${service.time}` : ''}
          </p>
          {/* API_POINT: Firestore — live availability summary wired in Phase 3 */}
          <div className="flex gap-3 mt-2 flex-wrap">
            <span className="text-xs font-medium text-harmonic-success">— confirmed</span>
            <span className="text-xs font-medium text-harmonic-warning">— pending</span>
            <span className="text-xs font-medium text-harmonic-danger">— unavailable</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-harmonic-border flex gap-2">
        {isDirector ? (
          <>
            <Link to={`/services/${service.id}/setlist`}>
              <Button variant="primary" size="sm">Open set list</Button>
            </Link>
            <Link to="/availability">
              <Button variant="outlined" size="sm">Availability</Button>
            </Link>
          </>
        ) : (
          <>
            <Link to={`/services/${service.id}/availability`}>
              <Button variant="primary" size="sm">Mark availability</Button>
            </Link>
            <Link to={`/services/${service.id}`}>
              <Button variant="outlined" size="sm">View set list</Button>
            </Link>
          </>
        )}
      </div>
    </Card>
  )
}
