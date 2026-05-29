import { useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CalendarDays, Users, Megaphone, Music2, Plus } from 'lucide-react'

// Stub dashboard — will be wired to Firestore in Phase 2
export function Dashboard() {
  const { harmonicUser, firebaseUser } = useAuth()
  const isDirector = harmonicUser?.role === 'director'
  const name = harmonicUser?.preferredName ?? harmonicUser?.displayName ?? firebaseUser?.displayName ?? 'there'

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-3xl mx-auto md:px-8">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-harmonic-text">
            Hey, {name.split(' ')[0]} 👋
          </h1>
          <p className="text-harmonic-muted text-sm mt-0.5">
            {isDirector ? "Here's what's happening with your choir." : "Here's what's coming up for your choir."}
          </p>
        </div>

        {/* Next service card — stub */}
        <section aria-labelledby="next-service-heading" className="mb-6">
          <h2 id="next-service-heading" className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3">
            Next service
          </h2>
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #18005F 0%, #560056 100%)' }}
                aria-hidden="true"
              >
                <CalendarDays size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-harmonic-text text-sm">Sunday Morning Service</p>
                <p className="text-harmonic-muted text-xs mt-0.5">Sunday, 1 June 2025 · 10:00 AM</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-xs font-medium text-harmonic-success">6 confirmed</span>
                  <span className="text-xs font-medium text-harmonic-warning">2 pending</span>
                  <span className="text-xs font-medium text-harmonic-danger">1 unavailable</span>
                </div>
              </div>
            </div>

            {!isDirector && (
              <div className="mt-4 pt-4 border-t border-harmonic-border flex gap-2">
                <Button variant="primary" size="sm" aria-label="Mark yourself as available">
                  I'm available
                </Button>
                <Button variant="outlined" size="sm" aria-label="Mark yourself as unavailable">
                  Can't make it
                </Button>
              </div>
            )}
          </Card>
        </section>

        {/* Quick actions (Director only) */}
        {isDirector && (
          <section aria-labelledby="quick-actions-heading" className="mb-6">
            <h2 id="quick-actions-heading" className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3">
              Quick actions
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Create set list', icon: Music2,    to: '/services/new' },
                { label: 'Post announcement', icon: Megaphone, to: '/announcements/new' },
                { label: 'View members', icon: Users,       to: '/members' },
              ].map(({ label, icon: Icon, to }) => (
                <a
                  key={to}
                  href={to}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-card shadow-card hover:shadow-card-hover transition-shadow text-center"
                  aria-label={label}
                >
                  <div className="w-10 h-10 rounded-full bg-harmonic-surface flex items-center justify-center">
                    <Icon size={18} className="text-harmonic-primary" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-medium text-harmonic-text leading-tight">{label}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming services — stub skeleton */}
        <section aria-labelledby="upcoming-heading" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 id="upcoming-heading" className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">
              Upcoming services
            </h2>
            {isDirector && (
              <a
                href="/services/new"
                className="flex items-center gap-1 text-xs font-medium text-harmonic-primary hover:opacity-80"
                aria-label="Create new service"
              >
                <Plus size={14} aria-hidden="true" />
                New
              </a>
            )}
          </div>

          {/* Mock upcoming services */}
          <div className="flex flex-col gap-3">
            {[
              { title: 'Sunday Morning Service', date: 'Sun, 1 Jun 2025', songs: 5 },
              { title: 'Midweek Prayer Service', date: 'Wed, 4 Jun 2025', songs: 3 },
            ].map((s) => (
              <Card key={s.title} className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-harmonic-text truncate">{s.title}</p>
                  <p className="text-harmonic-muted text-xs mt-0.5">{s.date} · {s.songs} songs</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-pill bg-harmonic-tertiary/10 text-harmonic-tertiary">
                  Draft
                </span>
              </Card>
            ))}
          </div>
        </section>

        {/* Latest announcement */}
        <section aria-labelledby="announcements-heading">
          <h2 id="announcements-heading" className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3">
            Latest announcement
          </h2>
          <Card className="p-4">
            <p className="font-semibold text-sm text-harmonic-text">Rehearsal moved to Thursday</p>
            <p className="text-harmonic-muted text-xs mt-1 leading-relaxed line-clamp-2">
              Just a heads up — this week's rehearsal has been rescheduled to Thursday at 6 PM.
              Please mark your availability when you can.
            </p>
            <p className="text-xs text-harmonic-muted mt-2">2 hours ago</p>
          </Card>
        </section>

      </div>
    </AppLayout>
  )
}
