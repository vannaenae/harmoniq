import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, ChevronRight, Mic2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useChoir } from '@/contexts/ChoirContext'
import { subscribeServices } from '@/lib/firestore'
import { subscribeAvailability } from '@/lib/availability'
import { voicePartLabel, cn } from '@/lib/utils'
import { availabilityMeta } from '@/lib/status'
import type { VoicePart, Availability, AvailabilityStatus } from '@/types'

const PART_FILTERS: { id: VoicePart | 'all'; label: string }[] = [
  { id: 'all',              label: 'All' },
  { id: 'soprano',          label: 'Soprano' },
  { id: 'alto',             label: 'Alto' },
  { id: 'tenor',            label: 'Tenor' },
  { id: 'bass',             label: 'Bass' },
  { id: 'keys',             label: 'Keys' },
  { id: 'guitar',           label: 'Guitar' },
  { id: 'bass_guitar',      label: 'Bass Guitar' },
  { id: 'drums',            label: 'Drums' },
  { id: 'other_instrument', label: 'Other' },
]

export function MembersDirectory() {
  const { choir, members, loading: choirLoading, isDirector } = useChoir()
  const [search, setSearch] = useState('')
  const [part, setPart] = useState<VoicePart | 'all'>('all')
  const [nextAvail, setNextAvail] = useState<Record<string, Availability>>({})

  // Load availability for the next upcoming service to show per-member status
  const [nextServiceId, setNextServiceId] = useState<string | null>(null)

  useEffect(() => {
    if (!choir) return
    const unsub = subscribeServices(choir.id, services => {
      const now = new Date()
      const next = services.find(s => s.date >= now)
      setNextServiceId(next?.id ?? null)
    })
    return unsub
  }, [choir])

  useEffect(() => {
    if (!choir || !nextServiceId) return
    const unsub = subscribeAvailability(choir.id, nextServiceId, setNextAvail)
    return unsub
  }, [choir, nextServiceId])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return members.filter(m => {
      const matchesPart = part === 'all' || m.voicePart === part
      const matchesName = !term || (m.preferredName || m.displayName).toLowerCase().includes(term)
      return matchesPart && matchesName
    })
  }, [members, search, part])

  const statusFor = (uid: string): AvailabilityStatus => nextAvail[uid]?.status ?? 'no_response'

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-3xl mx-auto md:px-8">
        <PageHeader
          title="Members"
          subtitle={choir?.name}
          actions={
            isDirector ? (
              <Link to="/members/invite">
                <Button variant="primary" size="sm">
                  <UserPlus size={16} /> Invite
                </Button>
              </Link>
            ) : undefined
          }
        />

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-harmonic-muted" aria-hidden="true" />
          <Input
            aria-label="Search members by name"
            placeholder="Search by name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Voice part filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1" role="tablist" aria-label="Filter by voice part">
          {PART_FILTERS.map(f => (
            <button
              key={f.id}
              role="tab"
              aria-selected={part === f.id}
              onClick={() => setPart(f.id)}
              className={cn(
                'px-4 py-2 rounded-pill text-sm font-semibold transition-all duration-200 whitespace-nowrap min-h-[40px]',
                part === f.id
                  ? 'bg-gradient-electric text-white shadow-btn-electric'
                  : 'bg-harmonic-surface text-harmonic-muted hover:text-harmonic-text hover:bg-harmonic-surfaceMid border border-harmonic-border/50',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {choirLoading ? (
          <div className="flex flex-col gap-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : members.length === 0 ? (
          <Card className="p-2">
            <EmptyState
              icon={UserPlus}
              title="Your choir is ready"
              description="Share your invite link to bring the team in."
              action={
                isDirector ? (
                  <Link to="/members/invite">
                    <Button variant="primary" size="sm"><UserPlus size={16} /> Invite members</Button>
                  </Link>
                ) : undefined
              }
            />
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-harmonic-muted text-center">No members match your search.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(m => {
              const meta = availabilityMeta[statusFor(m.uid)]
              return (
                <Link key={m.uid} to={`/members/${m.uid}`}>
                  <Card className="p-4 flex items-center gap-3 group" hoverable>
                    <Avatar src={m.photoURL} name={m.preferredName || m.displayName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-harmonic-text truncate group-hover:text-harmonic-electric transition-colors">
                          {m.preferredName || m.displayName}
                        </p>
                        {m.role === 'director' && <Badge tone="electric">Director</Badge>}
                        {m.canLead && (
                          <Mic2
                            size={13}
                            className="text-harmonic-neon flex-shrink-0"
                            aria-label="Can lead songs"
                          />
                        )}
                      </div>
                      <p className="text-xs text-harmonic-muted mt-0.5">
                        {voicePartLabel[m.voicePart] ?? m.voicePart}
                      </p>
                    </div>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <ChevronRight size={15} className="text-harmonic-muted group-hover:translate-x-0.5 group-hover:text-harmonic-electric transition-all flex-shrink-0" aria-hidden="true" />
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
