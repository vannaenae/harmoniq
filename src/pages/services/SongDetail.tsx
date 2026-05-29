import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Music2, ExternalLink } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { useChoir } from '@/contexts/ChoirContext'
import { getSetList } from '@/lib/firestore'
import type { SetListItem } from '@/types'

export function SongDetail() {
  const { serviceId, songId } = useParams<{ serviceId: string; songId: string }>()
  const { choir, members } = useChoir()
  const [item, setItem] = useState<SetListItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!choir || !serviceId || !songId) return
    let active = true
    setLoading(true)
    getSetList(choir.id, serviceId)
      .then(list => { if (active) setItem(list.find(i => i.songId === songId) ?? null) })
      .catch(err => console.error('Load song error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir, serviceId, songId])

  const lead = item?.leadVocalist
    ? members.find(m => m.uid === item.leadVocalist)
    : undefined

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader title="Song" back={`/services/${serviceId}`} />

        {loading ? (
          <Card className="p-6 space-y-4">
            <Skeleton className="h-40 w-full rounded-card" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ) : !item ? (
          <Card className="p-6">
            <p className="text-sm text-harmonic-muted text-center">This song isn't in the set list.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            {/* Album art — mock gradient; Spotify artwork in Phase 4 */}
            {/* API_POINT: Spotify — album artwork */}
            <div
              className="h-44 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #18005F 0%, #560056 100%)' }}
              aria-hidden="true"
            >
              <Music2 size={48} className="text-white/80" />
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-harmonic-text">{item.title}</h2>
                {item.artist && <p className="text-sm text-harmonic-muted mt-0.5">{item.artist}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">Key for this service</p>
                  <p className="text-sm text-harmonic-text mt-1">{item.key || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">Lead vocalist</p>
                  <p className="text-sm text-harmonic-text mt-1">
                    {lead ? (lead.preferredName || lead.displayName) : 'Unassigned'}
                  </p>
                </div>
              </div>

              {item.notes && (
                <div>
                  <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">Director's notes</p>
                  <p className="text-sm text-harmonic-text mt-1 leading-relaxed">{item.notes}</p>
                </div>
              )}

              {/* Spotify embed — stub; real embed in Phase 4 */}
              {/* API_POINT: Spotify — embed player https://open.spotify.com/embed/track/{trackId} */}
              <div className="bg-harmonic-surface rounded-2xl h-20 flex items-center justify-center">
                <p className="text-sm text-harmonic-muted">Spotify preview available soon</p>
              </div>

              {/* View Lyrics — stub; Genius URL in Phase 4 */}
              {/* API_POINT: Genius — lyrics page URL */}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => console.info('[stub] Open Genius lyrics for', item.title)}
              >
                <ExternalLink size={16} /> View lyrics
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
