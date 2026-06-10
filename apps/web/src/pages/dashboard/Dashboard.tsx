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
  Zap,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@harmoniq/shared'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@harmoniq/shared'
import { useChoir } from '@harmoniq/shared'
import { subscribeServices, getSetList, toDate } from '@harmoniq/shared'
import { getMyAvailability } from '@harmoniq/shared'
import { formatDate, cn } from '@harmoniq/shared'
import { serviceStatusMeta } from '@harmoniq/shared'
import type { Service, Announcement, Availability, SetListItem } from '@harmoniq/shared'

type AvailabilityStatus = 'available' | 'not_sure' | 'unavailable' | null

const availabilityDisplay: Record<
  NonNullable<AvailabilityStatus>,
  { label: string; icon: typeof Check; className: string; badgeTone: 'success' | 'warning' | 'danger' }
> = {
  available:   { label: "I'm in",        icon: Check,       className: 'text-harmonic-success', badgeTone: 'success' },
  not_sure:    { label: "Not sure",      icon: HelpCircle,  className: 'text-harmonic-warning', badgeTone: 'warning' },
  unavailable: { label: "Can't make it", icon: X,           className: 'text-harmonic-danger',  badgeTone: 'danger'  },
}

// Accent colors for bento grid stat tiles
const STAT_ACCENTS = [
  { bg: 'bg-gradient-electric',   shadow: 'shadow-btn-electric' },
  { bg: 'bg-gradient-neon',       shadow: 'shadow-card-hot' },
  { bg: 'bg-gradient-hot',        shadow: 'shadow-card-hot' },
  { bg: 'bg-gradient-teal',       shadow: 'shadow-card-glow' },
]

// Per-song icon accent colors (cycling)
const SONG_ICON_ACCENTS = [
  'bg-gradient-electric',
  'bg-gradient-neon',
  'bg-gradient-hot',
  'bg-gradient-teal',
  'bg-gradient-aurora',
]

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
      <div className="px-4 py-5 max-w-3xl mx-auto md:px-8 md:py-8">

        {/* ── Hero greeting ── */}
        <header className="mb-6 animate-fade-in-down">
          <div className="relative rounded-card-lg overflow-hidden bg-gradient-hero-vivid px-5 py-6" style={{ backgroundSize: '200% 200%' }}>
            {/* Animated orbs */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-harmonic-neon/25 blur-3xl animate-float" aria-hidden="true" />
            <div className="absolute -bottom-6 -left-4 w-32 h-32 rounded-full bg-harmonic-hot/20 blur-2xl" style={{ animationDelay: '1s' }} aria-hidden="true" />
            <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-harmonic-electric/20 blur-xl animate-float" style={{ animationDelay: '2s' }} aria-hidden="true" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-white/15 border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest">
                  <Zap size={10} className="text-harmonic-amber" />
                  {isDirector ? 'Director' : 'Member'}
                </span>
              </div>
              <h1 className="text-3xl font-bold font-cormorant text-white leading-tight tracking-tight">
                Hey, {name.split(' ')[0]}
              </h1>
              <p className="text-white/65 text-sm mt-1.5 font-crimson">
                {isDirector
                  ? "Here's the pulse of your choir."
                  : "Here's what's on your plate this week."}
              </p>
            </div>

            {/* Choir name tag */}
            {choir && (
              <div className="relative z-10 mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-white/10 border border-white/15">
                <span className="w-2 h-2 rounded-full bg-harmonic-amber animate-beat-pulse" aria-hidden="true" />
                <span className="text-xs font-semibold text-white/80">{choir.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* ── Director bento stats ── */}
        {isDirector && !loading && (
          <section aria-labelledby="stats-heading" className="mb-6 animate-fade-in-up">
            <h2 id="stats-heading" className="sr-only">Choir stats</h2>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { label: 'Members', value: members.length, icon: Users,       accent: STAT_ACCENTS[0] },
                { label: 'Services', value: upcoming.length, icon: CalendarDays, accent: STAT_ACCENTS[1] },
                { label: 'Confirmed', value: availabilityCounts?.confirmed ?? '-', icon: Check, accent: STAT_ACCENTS[2] },
                { label: 'Songs',   value: nextServiceSongs.length || '—', icon: Music2, accent: STAT_ACCENTS[3] },
              ].map(({ label, value, icon: Icon, accent }) => (
                <div key={label} className={cn('rounded-xl p-3 text-white text-center flex flex-col items-center gap-1.5', accent.bg, accent.shadow)}>
                  <Icon size={16} aria-hidden="true" className="opacity-90" />
                  <span className="text-xl font-bold leading-none">{value}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Next service ── */}
        <section aria-labelledby="next-service-heading" className="mb-6 animate-fade-in-up delay-50">
          <div className="flex items-center justify-between mb-3">
            <h2 id="next-service-heading" className="eyebrow flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-electric inline-block" aria-hidden="true" />
              Next service
            </h2>
            {nextService && (
              <Link to="/services" className="text-xs font-semibold text-harmonic-electric hover:opacity-80 flex items-center gap-1">
                All services <ArrowRight size={11} />
              </Link>
            )}
          </div>

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

        {/* ── Member: songs to practice ── */}
        {!isDirector && nextService && (
          <section aria-labelledby="practice-heading" className="mb-6 animate-fade-in-up delay-100">
            <div className="flex items-center justify-between mb-3">
              <h2 id="practice-heading" className="eyebrow flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-gradient-neon inline-block" aria-hidden="true" />
                Songs to practice
              </h2>
              <Link to={`/services/${nextService.id}`} className="text-xs font-semibold text-harmonic-electric hover:opacity-80 flex items-center gap-1">
                Full set list <ArrowRight size={11} />
              </Link>
            </div>
            {songsLoading ? (
              <SkeletonCard />
            ) : nextServiceSongs.length === 0 ? (
              <Card className="p-4">
                <p className="text-sm text-harmonic-muted text-center">Set list not published yet.</p>
              </Card>
            ) : (
              <Card className="overflow-hidden divide-y divide-harmonic-border/40">
                {nextServiceSongs.map((item, i) => (
                  <Link
                    key={item.songId}
                    to={`/services/${nextService.id}/songs/${item.songId}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-harmonic-surface/60 transition-colors group"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', SONG_ICON_ACCENTS[i % SONG_ICON_ACCENTS.length])}>
                      <Music2 size={14} className="text-white" aria-hidden="true" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-harmonic-text truncate group-hover:text-harmonic-electric transition-colors">{item.title}</p>
                      {item.artist && (
                        <p className="text-xs text-harmonic-muted truncate">{item.artist}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.key && (
                        <span className="key-badge">{item.key}</span>
                      )}
                      <ChevronRight size={14} className="text-harmonic-muted group-hover:text-harmonic-electric transition-colors" aria-hidden="true" />
                    </div>
                  </Link>
                ))}
                {nextServiceSongs.length === 4 && (
                  <Link
                    to={`/services/${nextService.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-harmonic-electric hover:bg-harmonic-surface/50 transition-colors"
                  >
                    <BookOpen size={13} aria-hidden="true" />
                    View all songs
                  </Link>
                )}
              </Card>
            )}
          </section>
        )}

        {/* ── Quick actions — Director only ── */}
        {isDirector && (
          <section aria-labelledby="quick-actions-heading" className="mb-6 animate-fade-in-up delay-100">
            <h2 id="quick-actions-heading" className="eyebrow flex items-center gap-2 mb-3">
              <span className="w-1.5 h-4 rounded-full bg-gradient-aurora inline-block" aria-hidden="true" />
              Quick actions
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'New service',       icon: Plus,     to: '/services/new',      accent: 'bg-gradient-electric', shadow: 'shadow-btn-electric' },
                { label: 'Announce',          icon: Megaphone, to: '/announcements/new', accent: 'bg-gradient-neon',     shadow: 'shadow-card-hot' },
                { label: 'Members',           icon: Users,    to: '/members',            accent: 'bg-gradient-teal',     shadow: 'shadow-card-glow' },
              ].map(({ label, icon: Icon, to, accent, shadow }) => (
                <Link
                  key={to}
                  to={to}
                  aria-label={label}
                  className="flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl border border-harmonic-border/60 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-center shadow-card"
                >
                  <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center', accent, shadow)}>
                    <Icon size={17} className="text-white" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-bold text-harmonic-text leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Upcoming services ── */}
        <section aria-labelledby="upcoming-heading" className="mb-6 animate-fade-in-up delay-150">
          <div className="flex items-center justify-between mb-3">
            <h2 id="upcoming-heading" className="eyebrow flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-teal inline-block" aria-hidden="true" />
              Upcoming services
            </h2>
            <Link to="/services" className="text-xs font-semibold text-harmonic-electric hover:opacity-80 flex items-center gap-1">
              See all <ArrowRight size={11} />
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
                const accentGrad = SONG_ICON_ACCENTS[i % SONG_ICON_ACCENTS.length]
                return (
                  <Link key={s.id} to={isDirector ? `/services/${s.id}/setlist` : `/services/${s.id}`}>
                    <Card
                      className="p-4 flex items-center gap-4 group"
                      hoverable
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', accentGrad)}>
                        <CalendarDays size={16} className="text-white" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-harmonic-text truncate group-hover:text-harmonic-electric transition-colors">{s.title}</p>
                        <p className="text-harmonic-muted text-xs mt-0.5">{formatDate(s.date)}</p>
                        {!isDirector && avMeta && (
                          <span className={cn('flex items-center gap-1 text-xs font-bold mt-1', avMeta.className)}>
                            <avMeta.icon size={11} aria-hidden="true" />
                            {avMeta.label}
                          </span>
                        )}
                        {!isDirector && !avMeta && (
                          <span className="text-xs text-harmonic-electric mt-1 block font-semibold">Tap to respond</span>
                        )}
                      </div>
                      {isDirector && (
                        <Badge tone={serviceStatusMeta[s.status].tone}>
                          {serviceStatusMeta[s.status].label}
                        </Badge>
                      )}
                      <ChevronRight size={15} className="text-harmonic-muted group-hover:text-harmonic-electric transition-colors flex-shrink-0" aria-hidden="true" />
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

        {/* ── Announcements ── */}
        <section aria-labelledby="activity-heading" className="animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-3">
            <h2 id="activity-heading" className="eyebrow flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-hot inline-block" aria-hidden="true" />
              {isDirector ? 'Recent activity' : 'Latest announcements'}
            </h2>
            <Link to="/announcements" className="text-xs font-semibold text-harmonic-electric hover:opacity-80 flex items-center gap-1">
              See all <ArrowRight size={11} />
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
                      <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', SONG_ICON_ACCENTS[(i + 2) % SONG_ICON_ACCENTS.length])}>
                        <Megaphone size={15} className="text-white" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-harmonic-text truncate group-hover:text-harmonic-electric transition-colors">{a.title}</p>
                        <p className="text-harmonic-muted text-xs mt-0.5 truncate">
                          {a.authorName} &middot; {formatDate(a.createdAt)}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-harmonic-muted group-hover:text-harmonic-electric transition-colors flex-shrink-0 mt-1" aria-hidden="true" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-5 text-center">
              <TrendingUp size={24} className="mx-auto mb-2 text-harmonic-border" />
              <p className="text-sm text-harmonic-muted">
                {isDirector
                  ? 'Activity from your team will appear here.'
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
    <div className="rounded-card-lg overflow-hidden shadow-card-neon" style={{ background: 'linear-gradient(145deg, #07030F 0%, #1A0050 40%, #7C3AED 80%, #EC4899 100%)' }}>
      {/* Decorative orbs */}
      <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full bg-harmonic-neon/20 blur-2xl pointer-events-none" aria-hidden="true" />

      <div className="px-5 pt-5 pb-4 relative">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 border border-white/20 shadow-inner-glow">
            <CalendarDays size={22} className="text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-base leading-tight truncate">{service.title}</p>
            <p className="text-white/60 text-xs mt-0.5">
              {formatDate(service.date)}
              {service.time ? ` · ${service.time}` : ''}
            </p>
          </div>
        </div>

        {isDirector && availabilityCounts && (
          <div className="flex gap-0 mt-4 rounded-xl overflow-hidden border border-white/15">
            {[
              { label: 'Confirmed', value: availabilityCounts.confirmed, accent: 'bg-harmonic-success/20' },
              { label: 'Pending',   value: availabilityCounts.pending,   accent: 'bg-white/10' },
              { label: 'Out',       value: availabilityCounts.unavailable, accent: 'bg-harmonic-danger/20' },
            ].map(({ label, value, accent }, idx, arr) => (
              <div key={label} className={cn('flex-1 text-center py-3', accent, idx < arr.length - 1 && 'border-r border-white/10')}>
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-[9px] text-white/65 font-bold uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        )}

        {!isDirector && avMeta && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-white/10 border border-white/10">
            <avMeta.icon size={14} aria-hidden="true" className="text-white/90" />
            <span className="text-xs font-bold text-white/90">Your response: {avMeta.label}</span>
          </div>
        )}
        {!isDirector && !avMeta && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-harmonic-amber/20 border border-harmonic-amber/30">
            <HelpCircle size={14} aria-hidden="true" className="text-harmonic-amber" />
            <span className="text-xs font-bold text-harmonic-amber">Haven't responded yet</span>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 flex gap-2.5">
        {isDirector ? (
          <>
            <Link to={`/services/${service.id}/setlist`} className="flex-1">
              <button className="w-full bg-white text-harmonic-primary text-sm font-bold px-4 py-2.5 rounded-pill hover:bg-white/90 active:scale-95 transition-all duration-150 min-h-[40px]">
                Open set list
              </button>
            </Link>
            <Link to="/availability">
              <button className="bg-white/15 border border-white/25 text-white text-sm font-semibold px-4 py-2.5 rounded-pill hover:bg-white/25 active:scale-95 transition-all duration-150 min-h-[40px]">
                Availability
              </button>
            </Link>
          </>
        ) : (
          <>
            <Link to={`/services/${service.id}/availability`} className="flex-1">
              <button className="w-full bg-white text-harmonic-primary text-sm font-bold px-4 py-2.5 rounded-pill hover:bg-white/90 active:scale-95 transition-all duration-150 min-h-[40px]">
                {myAvailability ? 'Update availability' : 'Mark availability'}
              </button>
            </Link>
            <Link to={`/services/${service.id}`}>
              <button className="bg-white/15 border border-white/25 text-white text-sm font-semibold px-4 py-2.5 rounded-pill hover:bg-white/25 active:scale-95 transition-all duration-150 min-h-[40px]">
                Set list
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
