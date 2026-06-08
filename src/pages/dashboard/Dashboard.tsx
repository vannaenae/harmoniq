import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Users,
  Megaphone,
  Music2,
  Plus,
  ChevronRight,
  Check,
  HelpCircle,
  X,
  BookOpen,
} from 'lucide-react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { subscribeServices, getSetList, toDate } from '@/lib/firestore'
import { getMyAvailability } from '@/lib/availability'
import { formatDate, cn } from '@/lib/utils'
import { serviceStatusMeta } from '@/lib/status'
import type { Service, Announcement, Availability, SetListItem } from '@/types'

type AvailabilityStatus = 'available' | 'not_sure' | 'unavailable' | null

const availabilityDisplay: Record<
  NonNullable<AvailabilityStatus>,
  { label: string; icon: typeof Check; className: string }
> = {
  available:   { label: "I'm in",     icon: Check,       className: 'text-harmonic-success' },
  not_sure:    { label: "Not sure",   icon: HelpCircle,  className: 'text-harmonic-warning' },
  unavailable: { label: "Can't make it", icon: X,        className: 'text-harmonic-danger'  },
}

export function Dashboard() {
  const { harmonicUser, firebaseUser } = useAuth()
  const { choir, members, isDirector } = useChoir()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(true)
  const [availabilityCounts, setAvailabilityCounts] = useState<{
    confirmed: number; pending: number; unavailable: number
  } | null>(null)
  // Member-specific state
  const [myNextServiceAvailability, setMyNextServiceAvailability] = useState<AvailabilityStatus>(null)
  const [nextServiceSongs, setNextServiceSongs] = useState<SetListItem[]>([])
  const [songsLoading, setSongsLoading] = useState(false)
  const [myUpcomingAvailability, setMyUpcomingAvailability] = useState<Record<string, AvailabilityStatus>>({})

  const name =
    harmonicUser?.preferredName ?? harmonicUser?.displayName ?? firebaseUser?.displayName ?? 'there'

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

  // Real-time announcements (latest 3)
  useEffect(() => {
    if (!choir) { setAnnouncements([]); setAnnouncementsLoading(false); return }
    setAnnouncementsLoading(true)
    const q = query(
      collection(db, 'choirs', choir.id, 'announcements'),
      orderBy('createdAt', 'desc'),
      limit(3),
    )
    const unsub = onSnapshot(q, snap => {
      setAnnouncements(
        snap.docs.map(d => {
          const data = d.data()
          return { ...data, id: d.id, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) } as Announcement
        }),
      )
      setAnnouncementsLoading(false)
    }, () => { setAnnouncementsLoading(false) })
    return unsub
  }, [choir])

  const now = new Date()
  const upcoming = services
    .filter(s => s.date >= now && (s.status === 'published' || isDirector))
    .slice(0, 3)
  const nextService = upcoming[0]

  // Real-time availability counts for the next service (director view)
  useEffect(() => {
    if (!choir || !nextService) { setAvailabilityCounts(null); return }
    const unsub = onSnapshot(
      collection(db, 'choirs', choir.id, 'services', nextService.id, 'availability'),
      snap => {
        let confirmed = 0
        let pending = 0
        let unavailable = 0
        snap.docs.forEach(d => {
          const status = (d.data() as Availability).status
          if (status === 'available') confirmed++
          else if (status === 'unavailable') unavailable++
          else pending++
        })
        const responded = snap.docs.length
        const totalMembers = members.length
        if (totalMembers > responded) pending += totalMembers - responded
        setAvailabilityCounts({ confirmed, pending, unavailable })
      },
      () => { setAvailabilityCounts(null) },
    )
    return unsub
  }, [choir, nextService?.id, members.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Member: load my availability for next service + songs to practice
  useEffect(() => {
    if (!choir || !nextService || !firebaseUser || isDirector) {
      setMyNextServiceAvailability(null)
      setNextServiceSongs([])
      return
    }
    let active = true
    setSongsLoading(true)
    Promise.all([
      getMyAvailability(choir.id, nextService.id, firebaseUser.uid),
      getSetList(choir.id, nextService.id),
    ]).then(([avail, songs]) => {
      if (!active) return
      setMyNextServiceAvailability((avail?.status as AvailabilityStatus) ?? null)
      setNextServiceSongs(songs.slice(0, 4))
    }).catch(err => console.error('Load member dashboard data error:', err))
      .finally(() => { if (active) setSongsLoading(false) })
    return () => { active = false }
  }, [choir, nextService?.id, firebaseUser, isDirector]) // eslint-disable-line react-hooks/exhaustive-deps

  // Member: load my availability for all upcoming services (to show inline status)
  useEffect(() => {
    if (!choir || !firebaseUser || isDirector || upcoming.length === 0) return
    let active = true
    Promise.all(
      upcoming.map(s =>
        getMyAvailability(choir.id, s.id, firebaseUser.uid).then(a => ({ id: s.id, status: (a?.status as AvailabilityStatus) ?? null })),
      ),
    ).then(results => {
      if (!active) return
      const map: Record<string, AvailabilityStatus> = {}
      results.forEach(r => { map[r.id] = r.status })
      setMyUpcomingAvailability(map)
    }).catch(() => {})
    return () => { active = false }
  }, [choir, firebaseUser, isDirector, upcoming.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppLayout>
      <div className="px-5 py-6 max-w-3xl mx-auto md:px-8">
        {/* Greeting — gradient hero */}
        <header className="mb-7 animate-fade-in-down">
          <div className="relative rounded-2xl bg-gradient-hero px-5 py-5 overflow-hidden">
            {/* Decorative orbs */}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
            <div className="absolute bottom-0 left-8 w-20 h-20 rounded-full bg-harmonic-magenta/20 blur-2xl" aria-hidden="true" />
            <div className="relative">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
                {isDirector ? 'Director' : 'Member'}
              </p>
              <h1 className="text-2xl font-bold font-cormorant text-white leading-tight">
                Hey, {name.split(' ')[0]}
              </h1>
              <p className="text-white/75 text-sm font-crimson mt-1">
                {isDirector
                  ? "Here's what's happening with your choir."
                  : "Here's what you need to do this week."}
              </p>
            </div>
          </div>
        </header>

        {/* Next service */}
        <section aria-labelledby="next-service-heading" className="mb-6 animate-fade-in-up delay-50">
          <h2
            id="next-service-heading"
            className="text-[11px] font-bold text-harmonic-muted uppercase tracking-widest mb-3 flex items-center gap-2"
          >
            <span className="w-1 h-3 rounded-full bg-gradient-brand inline-block" aria-hidden="true" />
            Next service
          </h2>

          {loading ? (
            <SkeletonCard />
          ) : nextService ? (
            <NextServiceCard
              service={nextService}
              isDirector={isDirector}
              availabilityCounts={availabilityCounts}
              myAvailability={myNextServiceAvailability}
            />
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

        {/* Member: songs to practice */}
        {!isDirector && nextService && (
          <section aria-labelledby="practice-heading" className="mb-6 animate-fade-in-up delay-100">
            <div className="flex items-center justify-between mb-3">
              <h2
                id="practice-heading"
                className="text-[11px] font-bold text-harmonic-muted uppercase tracking-widest flex items-center gap-2"
              >
                <span className="w-1 h-3 rounded-full bg-gradient-electric inline-block" aria-hidden="true" />
                Songs to practice
              </h2>
              <Link
                to={`/services/${nextService.id}`}
                className="text-xs font-medium text-harmonic-primary hover:opacity-80"
              >
                Full set list
              </Link>
            </div>
            {songsLoading ? (
              <SkeletonCard />
            ) : nextServiceSongs.length === 0 ? (
              <Card className="p-4">
                <p className="text-sm text-harmonic-muted text-center">Set list not published yet.</p>
              </Card>
            ) : (
              <Card className="divide-y divide-harmonic-border/50 overflow-hidden">
                {nextServiceSongs.map((item, i) => (
                  <Link
                    key={item.songId}
                    to={`/services/${nextService.id}/songs/${item.songId}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-harmonic-primary/5 transition-colors group"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-card-accent border border-harmonic-primary/15">
                      <Music2 size={14} className="text-harmonic-primary" aria-hidden="true" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-harmonic-text truncate group-hover:text-harmonic-primary transition-colors">{item.title}</p>
                      {item.artist && (
                        <p className="text-xs text-harmonic-muted truncate">{item.artist}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.key && (
                        <span className="text-xs font-bold text-harmonic-secondary bg-harmonic-secondary/10 px-2 py-0.5 rounded-full border border-harmonic-secondary/20">
                          {item.key}
                        </span>
                      )}
                      <ChevronRight size={14} className="text-harmonic-muted group-hover:text-harmonic-primary transition-colors" aria-hidden="true" />
                    </div>
                  </Link>
                ))}
                {nextServiceSongs.length === 4 && (
                  <Link
                    to={`/services/${nextService.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium text-harmonic-primary hover:bg-harmonic-surface/50 transition-colors"
                  >
                    <BookOpen size={13} aria-hidden="true" />
                    View all songs
                  </Link>
                )}
              </Card>
            )}
          </section>
        )}

        {/* Quick actions — Director only */}
        {isDirector && (
          <section aria-labelledby="quick-actions-heading" className="mb-6 animate-fade-in-up delay-100">
            <h2
              id="quick-actions-heading"
              className="text-[11px] font-bold text-harmonic-muted uppercase tracking-widest mb-3 flex items-center gap-2"
            >
              <span className="w-1 h-3 rounded-full bg-gradient-warm inline-block" aria-hidden="true" />
              Quick actions
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Create set list', icon: Music2, to: '/services/new', gradient: 'from-harmonic-primary to-harmonic-tertiary' },
                { label: 'Post announcement', icon: Megaphone, to: '/announcements/new', gradient: 'from-harmonic-secondary to-harmonic-magenta' },
                { label: 'View members', icon: Users, to: '/members', gradient: 'from-harmonic-indigo to-harmonic-violet' },
              ].map(({ label, icon: Icon, to, gradient }) => (
                <Link
                  key={to}
                  to={to}
                  aria-label={label}
                  className="flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl border border-harmonic-border/50 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-center shadow-card"
                >
                  <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                    <Icon size={17} className="text-white" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-semibold text-harmonic-text leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming services */}
        <section aria-labelledby="upcoming-heading" className="mb-6 animate-fade-in-up delay-150">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="upcoming-heading"
              className="text-[11px] font-bold text-harmonic-muted uppercase tracking-widest flex items-center gap-2"
            >
              <span className="w-1 h-3 rounded-full bg-harmonic-success/80 inline-block" aria-hidden="true" />
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
            <div className="flex flex-col gap-2.5">
              {upcoming.map((s, i) => {
                const myStatus = myUpcomingAvailability[s.id]
                const avMeta = myStatus ? availabilityDisplay[myStatus] : null
                return (
                  <Link key={s.id} to={isDirector ? `/services/${s.id}/setlist` : `/services/${s.id}`}>
                    <Card
                      className="p-4 flex items-center gap-4 group"
                      hoverable
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-card-accent border border-harmonic-primary/15 flex items-center justify-center flex-shrink-0">
                        <CalendarDays size={16} className="text-harmonic-primary" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-harmonic-text truncate group-hover:text-harmonic-primary transition-colors">{s.title}</p>
                        <p className="text-harmonic-muted text-xs mt-0.5">{formatDate(s.date)}</p>
                        {!isDirector && avMeta && (
                          <span className={cn('flex items-center gap-1 text-xs font-semibold mt-1', avMeta.className)}>
                            <avMeta.icon size={11} aria-hidden="true" />
                            {avMeta.label}
                          </span>
                        )}
                        {!isDirector && !avMeta && (
                          <span className="text-xs text-harmonic-muted mt-1 block">Tap to mark availability</span>
                        )}
                      </div>
                      {isDirector && (
                        <Badge tone={serviceStatusMeta[s.status].tone}>
                          {serviceStatusMeta[s.status].label}
                        </Badge>
                      )}
                      <ChevronRight size={15} className="text-harmonic-muted group-hover:text-harmonic-primary transition-colors flex-shrink-0" aria-hidden="true" />
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card className="p-6">
              <p className="text-sm text-harmonic-muted text-center">
                No upcoming services on the calendar.
              </p>
            </Card>
          )}
        </section>

        {/* Recent announcements */}
        <section aria-labelledby="activity-heading" className="animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="activity-heading"
              className="text-[11px] font-bold text-harmonic-muted uppercase tracking-widest flex items-center gap-2"
            >
              <span className="w-1 h-3 rounded-full bg-harmonic-warning/80 inline-block" aria-hidden="true" />
              {isDirector ? 'Recent activity' : 'Latest announcements'}
            </h2>
            <Link
              to="/announcements"
              className="text-xs font-medium text-harmonic-primary hover:opacity-80"
            >
              See all
            </Link>
          </div>

          {announcementsLoading ? (
            <SkeletonCard />
          ) : announcements.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {announcements.map((a, i) => (
                <Link key={a.id} to="/announcements">
                  <Card className="p-4 group" hoverable style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-harmonic-secondary to-harmonic-magenta flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Megaphone size={15} className="text-white" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-harmonic-text truncate group-hover:text-harmonic-primary transition-colors">{a.title}</p>
                        <p className="text-harmonic-muted text-xs mt-0.5 truncate">
                          {a.authorName} &middot; {formatDate(a.createdAt)}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-harmonic-muted group-hover:text-harmonic-primary transition-colors flex-shrink-0 mt-1" aria-hidden="true" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-4">
              <p className="text-sm text-harmonic-muted text-center">
                {isDirector
                  ? 'Activity from your team will show up here once things get going.'
                  : 'Messages from your director will appear here.'}
              </p>
            </Card>
          )}
        </section>
      </div>
    </AppLayout>
  )
}

function NextServiceCard({
  service,
  isDirector,
  availabilityCounts,
  myAvailability,
}: {
  service: Service
  isDirector: boolean
  availabilityCounts: { confirmed: number; pending: number; unavailable: number } | null
  myAvailability: AvailabilityStatus
}) {
  const avMeta = myAvailability ? availabilityDisplay[myAvailability] : null

  return (
    <div className="rounded-2xl bg-gradient-brand-vivid text-white overflow-hidden shadow-card-glow">
      {/* Header content */}
      <div className="px-5 pt-5 pb-4 relative">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/8 blur-2xl" aria-hidden="true" />
        <div className="flex items-start gap-3 relative">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/20">
            <CalendarDays size={20} className="text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-base leading-tight truncate">{service.title}</p>
            <p className="text-white/70 text-xs mt-0.5">
              {formatDate(service.date)}
              {service.time ? ` · ${service.time}` : ''}
            </p>
          </div>
        </div>

        {isDirector && availabilityCounts && (
          <div className="flex gap-4 mt-4 p-3 rounded-xl bg-white/10 border border-white/10">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{availabilityCounts.confirmed}</p>
              <p className="text-[10px] text-white/70 font-medium uppercase tracking-wide">Confirmed</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{availabilityCounts.pending}</p>
              <p className="text-[10px] text-white/70 font-medium uppercase tracking-wide">Pending</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{availabilityCounts.unavailable}</p>
              <p className="text-[10px] text-white/70 font-medium uppercase tracking-wide">Out</p>
            </div>
          </div>
        )}

        {!isDirector && avMeta && (
          <div className={cn('flex items-center gap-2 mt-3 text-xs font-semibold')}>
            <avMeta.icon size={13} aria-hidden="true" className="text-white/90" />
            <span className="text-white/90">Your response: {avMeta.label}</span>
          </div>
        )}
        {!isDirector && !avMeta && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-white/80">
            <HelpCircle size={13} aria-hidden="true" />
            You haven't responded yet
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        {isDirector ? (
          <>
            <Link to={`/services/${service.id}/setlist`} className="flex-1">
              <button className="w-full bg-white text-harmonic-primary text-sm font-bold px-4 py-2 rounded-pill hover:bg-white/90 active:scale-95 transition-all duration-150 min-h-[40px]">
                Open set list
              </button>
            </Link>
            <Link to="/availability">
              <button className="bg-white/20 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-pill hover:bg-white/30 active:scale-95 transition-all duration-150 min-h-[40px]">
                Availability
              </button>
            </Link>
          </>
        ) : (
          <>
            <Link to={`/services/${service.id}/availability`} className="flex-1">
              <button className="w-full bg-white text-harmonic-primary text-sm font-bold px-4 py-2 rounded-pill hover:bg-white/90 active:scale-95 transition-all duration-150 min-h-[40px]">
                {myAvailability ? 'Update availability' : 'Mark availability'}
              </button>
            </Link>
            <Link to={`/services/${service.id}`}>
              <button className="bg-white/20 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-pill hover:bg-white/30 active:scale-95 transition-all duration-150 min-h-[40px]">
                Set list
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
