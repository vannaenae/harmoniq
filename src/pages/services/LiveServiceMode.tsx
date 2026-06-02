import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Play, Pause, SkipForward, CheckCircle2, Clock, Music2,
  ChevronLeft, StickyNote, FileText, Users,
} from 'lucide-react'
import { onSnapshot, doc, collection, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChoir } from '@/contexts/ChoirContext'
import { toDate } from '@/lib/firestore'
import { cn } from '@/lib/utils'
import type { Service, SetListItem } from '@/types'

type LiveTab = 'lyrics' | 'notes'

export function LiveServiceMode() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const navigate = useNavigate()
  const { choir, members, isDirector } = useChoir()

  const [service, setService] = useState<Service | null>(null)
  const [items, setItems] = useState<SetListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [activeTab, setActiveTab] = useState<LiveTab>('lyrics')

  // Real-time subscription for service doc
  useEffect(() => {
    if (!choir || !serviceId) return
    const unsub = onSnapshot(
      doc(db, 'choirs', choir.id, 'services', serviceId),
      snap => {
        if (!snap.exists()) return
        const data = snap.data()
        setService({
          ...data,
          id: snap.id,
          date: toDate(data.date),
          availabilityDeadline: data.availabilityDeadline ? toDate(data.availabilityDeadline) : undefined,
          setListDeadline: data.setListDeadline ? toDate(data.setListDeadline) : undefined,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
        } as Service)
      },
    )
    return unsub
  }, [choir, serviceId])

  // Real-time subscription for set list items
  useEffect(() => {
    if (!choir || !serviceId) return
    const q = query(
      collection(db, 'choirs', choir.id, 'services', serviceId, 'setlist'),
      orderBy('order', 'asc'),
    )
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ ...d.data(), songId: d.id }) as SetListItem))
      setLoading(false)
    })
    return unsub
  }, [choir, serviceId])

  // Elapsed timer when playing
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [isPlaying])

  const currentSong = items[currentIndex] ?? null
  const completedCount = currentIndex
  const totalCount = items.length

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(i => i + 1)
      setElapsed(0)
    }
  }, [currentIndex, items.length])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
      setElapsed(0)
    }
  }, [currentIndex])

  const togglePlay = useCallback(() => {
    setIsPlaying(p => !p)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const nameFor = (uid?: string) => {
    if (!uid) return null
    const m = members.find(x => x.uid === uid)
    return m ? (m.preferredName || m.displayName) : null
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(`/services/${serviceId}`)}
            aria-label="Go back"
            className="p-1.5 -ml-1.5 rounded-full hover:bg-harmonic-surface transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft size={20} className="text-harmonic-text" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-harmonic-secondary uppercase tracking-widest">
                Live Service Mode
              </p>
              {isPlaying && (
                <span className="w-2 h-2 rounded-full bg-harmonic-success animate-pulse" />
              )}
            </div>
            <h1 className="text-lg font-bold text-harmonic-text truncate">
              {service?.title ?? 'Service'}
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-card" />
            <Skeleton className="h-24 w-full rounded-card" />
            <Skeleton className="h-64 w-full rounded-card" />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-2">
            <EmptyState
              icon={Music2}
              title="No set list"
              description="Add songs to this service's set list before starting live mode."
            />
          </Card>
        ) : (
          <>
            {/* Current Song Hero Card */}
            <div
              className="rounded-3xl p-6 mb-4 text-white relative overflow-hidden bg-featured-song-gradient"
            >              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
                Current Segment
              </p>
              <h2 className="text-2xl font-bold tracking-tight">
                {currentSong?.title ?? 'No song'}
              </h2>
              {(currentSong?.artist || currentSong?.key) && (
                <p className="text-sm text-white/80 mt-1">
                  {nameFor(currentSong.leadVocalist) && `Lead: ${nameFor(currentSong.leadVocalist)} · `}
                  {currentSong.artist && `${currentSong.artist} · `}
                  {currentSong.key && `Key: ${currentSong.key}`}
                </p>
              )}

              {/* Timer */}
              <div className="flex items-center gap-3 mt-5">
                <span className="text-2xl font-bold tabular-nums">{formatTime(elapsed)}</span>
              </div>

              {/* Playback Controls — director only */}
              {isDirector && (
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center disabled:opacity-30 hover:bg-white/25 transition-colors"
                    aria-label="Previous segment"
                  >
                    <SkipForward size={18} className="text-white rotate-180" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying
                      ? <Pause size={20} className="text-[#18005F]" />
                      : <Play size={20} className="text-[#18005F] ml-0.5" />
                    }
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex >= items.length - 1}
                    className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center disabled:opacity-30 hover:bg-white/25 transition-colors"
                    aria-label="Next segment"
                  >
                    <SkipForward size={18} className="text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Lyrics / Notes Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('lyrics')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium transition-colors',
                  activeTab === 'lyrics'
                    ? 'bg-harmonic-primary text-white'
                    : 'bg-harmonic-surface text-harmonic-muted hover:text-harmonic-text',
                )}
              >
                <FileText size={14} />
                Lyrics
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium transition-colors',
                  activeTab === 'notes'
                    ? 'bg-harmonic-primary text-white'
                    : 'bg-harmonic-surface text-harmonic-muted hover:text-harmonic-text',
                )}
              >
                <StickyNote size={14} />
                Flow Notes
              </button>
            </div>

            {/* Tab Content */}
            <Card className="p-4 mb-5 min-h-[80px]">
              {activeTab === 'lyrics' ? (
                <p className="text-sm text-harmonic-muted whitespace-pre-wrap font-mono leading-relaxed">
                  {currentSong?.notes
                    ? currentSong.notes
                    : 'No lyrics available for this song.'}
                </p>
              ) : (
                <p className="text-sm text-harmonic-muted leading-relaxed">
                  {currentSong?.notes ?? 'No flow notes for this segment.'}
                </p>
              )}
            </Card>

            {/* Run Sheet */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-harmonic-text">Run Sheet</h3>
              <Badge tone="muted">
                {totalCount - completedCount} items remaining
              </Badge>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((item, idx) => {
                const isCompleted = idx < currentIndex
                const isCurrent = idx === currentIndex
                const isUpcoming = idx === currentIndex + 1
                const lead = nameFor(item.leadVocalist)

                return (
                  <Card
                    key={item.songId}
                    className={cn(
                      'p-4 transition-all',
                      isCurrent && 'ring-2 ring-harmonic-primary shadow-lg',
                      isCompleted && 'opacity-60',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Status icon */}
                      <span className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        isCompleted && 'bg-harmonic-success/10',
                        isCurrent && 'bg-harmonic-primary/10',
                        !isCompleted && !isCurrent && 'bg-harmonic-surface',
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 size={16} className="text-harmonic-success" />
                        ) : isCurrent ? (
                          <Play size={14} className="text-harmonic-primary ml-0.5" />
                        ) : (
                          <Clock size={14} className="text-harmonic-muted" />
                        )}
                      </span>

                      <div className="flex-1 min-w-0">
                        {/* Status labels */}
                        <div className="flex items-center gap-2 mb-0.5">
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-harmonic-primary uppercase tracking-widest">
                              Now Playing
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="text-[10px] font-bold text-harmonic-warning uppercase tracking-widest">
                              Upcoming
                            </span>
                          )}
                        </div>
                        <p className={cn(
                          'font-semibold text-sm truncate',
                          isCurrent ? 'text-harmonic-text' : 'text-harmonic-muted',
                        )}>
                          {item.title}
                        </p>
                        <p className="text-xs text-harmonic-muted truncate">
                          {item.artist ?? ''}
                          {item.key ? ` · Key of ${item.key}` : ''}
                        </p>
                        {lead && (
                          <p className="text-xs text-harmonic-secondary font-medium mt-0.5">
                            {lead}
                          </p>
                        )}
                      </div>

                      {/* Key badge */}
                      {item.key && (
                        <Badge tone="muted">{item.key}</Badge>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Preparation Status Summary */}
            {service?.rosteredMemberIds && service.rosteredMemberIds.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} className="text-harmonic-primary" aria-hidden="true" />
                  <h3 className="text-base font-bold text-harmonic-text">
                    Member Status
                  </h3>
                  <Badge tone="muted">{service.rosteredMemberIds.length} rostered</Badge>
                </div>
                <Card className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {service.rosteredMemberIds.map(uid => {
                      const m = members.find(x => x.uid === uid)
                      if (!m) return null
                      const name = m.preferredName || m.displayName
                      const initials = name
                        .split(' ')
                        .map(w => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                      return (
                        <div
                          key={uid}
                          className="flex items-center gap-2 bg-harmonic-surface rounded-full pl-1 pr-3 py-1"
                        >
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-featured-song-gradient"
                          >
                            {initials}
                          </span>
                          <span className="text-xs font-medium text-harmonic-text">{name}</span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-harmonic-muted mb-2">
                <span>Progress</span>
                <span>{completedCount} / {totalCount} completed</span>
              </div>
              <div className="h-2 bg-harmonic-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-featured-song-gradient"
                  style={{
                    width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
