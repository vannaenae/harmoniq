import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlbumArt } from '@/components/ui/AlbumArt'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { useChoir } from '@/contexts/ChoirContext'
import { getSetList } from '@/lib/firestore'
import { fetchSpotify, fetchGenius, spotifyEmbedUrl, type SpotifyData, type GeniusData } from '@/lib/integrations'
import type { SetListItem } from '@/types'

export function SongDetail() {
  const { serviceId, songId } = useParams<{ serviceId: string; songId: string }>()
  const { choir, members } = useChoir()
  const [item, setItem] = useState<SetListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [spotify, setSpotify] = useState<SpotifyData | null>(null)
  const [genius, setGenius] = useState<GeniusData | null>(null)
  const [mediaError, setMediaError] = useState(false)

  useEffect(() => {
    if (!choir || !serviceId || !songId) return
    let active = true
    setLoading(true)
    getSetList(choir.id, serviceId)
      .then(async list => {
        const found = list.find(i => i.songId === songId) ?? null
        if (!active) return
        setItem(found)
        if (found) {
          const [sp, ge] = await Promise.all([
            fetchSpotify(found.title, found.artist),
            fetchGenius(found.title, found.artist),
          ])
          if (!active) return
          setSpotify(sp); setGenius(ge)
          if (!sp && !ge) setMediaError(true)
        }
      })
      .catch(err => console.error('Load song error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir, serviceId, songId])

  const lead = item?.leadVocalist ? members.find(m => m.uid === item.leadVocalist) : undefined
  const trackId = spotify?.trackId ?? null
  const lyricsUrl = genius?.url ?? null

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
            {/* API_POINT: Spotify — album artwork */}
            <AlbumArt src={spotify?.albumArtUrl} alt={`${item.title} artwork`} className="h-44 w-full" iconSize={48} />

            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-harmonic-text">{item.title}</h2>
                {item.artist && <p className="text-sm text-harmonic-muted mt-0.5">{item.artist}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">Key for this service</p>
                  <p className="text-sm text-harmonic-text mt-1">{item.key || spotify?.keyNote || 'Not set'}</p>
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

              {mediaError && (
                <div className="bg-harmonic-surface rounded-xl px-4 py-3 text-sm text-harmonic-muted">
                  Song details couldn't load. You can still use the song.
                </div>
              )}

              {/* API_POINT: Spotify — embed player */}
              {trackId ? (
                <iframe
                  title={`Spotify preview of ${item.title}`}
                  src={spotifyEmbedUrl(trackId)}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="encrypted-media"
                  className="rounded-xl"
                />
              ) : !mediaError && (
                <div className="bg-harmonic-surface rounded-xl h-20 flex items-center justify-center">
                  <p className="text-sm text-harmonic-muted">No Spotify match found</p>
                </div>
              )}

              {/* API_POINT: Genius — lyrics page link */}
              {lyricsUrl ? (
                <a href={lyricsUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outlined" fullWidth>
                    <ExternalLink size={16} /> View lyrics on Genius
                  </Button>
                </a>
              ) : (
                <Button variant="outlined" fullWidth disabled>
                  <ExternalLink size={16} /> Lyrics unavailable
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
