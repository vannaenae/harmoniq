import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink, Plus, Check } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { AlbumArt } from '@/components/ui/AlbumArt'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ServiceSelect } from '@/components/ServiceSelect'
import { useChoir } from '@/contexts/ChoirContext'
import { getSong, cacheSongMedia, ALL_KEYS } from '@/lib/songs'
import { fetchSpotify, fetchGenius, spotifyEmbedUrl, type SpotifyData, type GeniusData } from '@/lib/integrations'
import { listServices, getSetList, saveSetList } from '@/lib/firestore'
import type { Song, Service } from '@/types'

export function SongLibraryDetail() {
  const { songId } = useParams<{ songId: string }>()
  const { choir, isDirector } = useChoir()
  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [spotify, setSpotify] = useState<SpotifyData | null>(null)
  const [genius, setGenius] = useState<GeniusData | null>(null)
  const [mediaError, setMediaError] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    if (!choir || !songId) return
    let active = true
    setLoading(true)
    getSong(choir.id, songId)
      .then(async s => {
        if (!active) return
        setSong(s)
        if (s) {
          // Resolve media via Cloud Functions (cached). Graceful on failure.
          const [sp, ge] = await Promise.all([
            fetchSpotify(s.title, s.artist),
            fetchGenius(s.title, s.artist),
          ])
          if (!active) return
          setSpotify(sp)
          setGenius(ge)
          if (!sp && !ge) setMediaError(true)
          // Cache resolved media back onto custom songs
          if (s.isCustom && (sp?.trackId || sp?.albumArtUrl || ge?.url)) {
            cacheSongMedia(choir.id, s.id, {
              spotifyTrackId: sp?.trackId, albumArtUrl: sp?.albumArtUrl, geniusUrl: ge?.url,
            })
          }
        }
      })
      .catch(err => console.error('Load song error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir, songId])

  const lyricsUrl = genius?.url ?? song?.geniusUrl ?? song?.lyricsUrl ?? null
  const trackId = spotify?.trackId ?? song?.spotifyTrackId ?? null
  const artUrl = spotify?.albumArtUrl ?? song?.albumArtUrl ?? null

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader title="Song" back="/library" />

        {loading ? (
          <Card className="p-6 space-y-4">
            <Skeleton className="h-44 w-full rounded-card" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ) : !song ? (
          <Card className="p-2"><EmptyState title="Song not found" description="It may have been removed from the library." /></Card>
        ) : (
          <Card className="overflow-hidden">
            <AlbumArt src={artUrl} alt={`${song.title} artwork`} className="h-48 w-full" iconSize={48} />

            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-harmonic-text">{song.title}</h2>
                {song.artist && <p className="text-sm text-harmonic-muted mt-0.5">{song.artist}</p>}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {song.genre && <Badge tone="tertiary">{song.genre}</Badge>}
                  {song.isCustom && <Badge tone="primary">Custom</Badge>}
                  {spotify?.tempo && <Badge tone="muted">{spotify.tempo} BPM</Badge>}
                </div>
              </div>

              {/* Key options */}
              <div>
                <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-2">Key options</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_KEYS.map(k => (
                    <span
                      key={k}
                      className={
                        (song.defaultKey === k || spotify?.keyNote === k)
                          ? 'px-2.5 py-1 rounded-pill text-xs font-semibold bg-harmonic-primary text-white'
                          : 'px-2.5 py-1 rounded-pill text-xs font-medium bg-harmonic-surface text-harmonic-muted'
                      }
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Media error state */}
              {mediaError && (
                <div className="bg-harmonic-surface rounded-xl px-4 py-3 text-sm text-harmonic-muted">
                  Song details couldn't load. You can still use the song.
                </div>
              )}

              {/* Spotify embed */}
              {trackId ? (
                /* API_POINT: Spotify — embed player (works without Premium) */
                <iframe
                  title={`Spotify preview of ${song.title}`}
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

              {/* Lyrics + Add to set list */}
              <div className="flex flex-col gap-2">
                {lyricsUrl && (
                  /* API_POINT: Genius — links out to the lyrics page (never inline lyrics) */
                  <a href={lyricsUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outlined" fullWidth>
                      <ExternalLink size={16} /> View lyrics on Genius
                    </Button>
                  </a>
                )}
                {isDirector && (
                  <Button variant="primary" fullWidth onClick={() => setAddOpen(true)}>
                    <Plus size={16} /> Add to set list
                  </Button>
                )}
              </div>

              {/* Usage history */}
              <UsageHistory choirId={choir!.id} songId={song.id} />
            </div>
          </Card>
        )}
      </div>

      {song && choir && (
        <AddToSetListModal open={addOpen} onOpenChange={setAddOpen} choirId={choir.id} song={song} />
      )}
    </AppLayout>
  )
}

function UsageHistory({ choirId, songId }: { choirId: string; songId: string }) {
  const [last, setLast] = useState<{ title: string; date: Date } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const services = await listServices(choirId)
        for (const svc of [...services].sort((a, b) => +b.date - +a.date)) {
          const list = await getSetList(choirId, svc.id)
          if (list.some(i => i.songId === songId)) {
            if (active) setLast({ title: svc.title, date: svc.date })
            break
          }
        }
      } catch { /* ignore */ }
      finally { if (active) setLoading(false) }
    })()
    return () => { active = false }
  }, [choirId, songId])

  return (
    <div className="pt-2 border-t border-harmonic-border">
      <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-1">Usage history</p>
      {loading ? (
        <Skeleton className="h-4 w-2/3" />
      ) : last ? (
        <p className="text-sm text-harmonic-text">
          Last used at <span className="font-medium">{last.title}</span> · {last.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      ) : (
        <p className="text-sm text-harmonic-muted">Not used in a service yet.</p>
      )}
    </div>
  )
}

function AddToSetListModal({
  open, onOpenChange, choirId, song,
}: { open: boolean; onOpenChange: (o: boolean) => void; choirId: string; song: Song }) {
  const [services, setServices] = useState<Service[]>([])
  const [serviceId, setServiceId] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    listServices(choirId).then(s => {
      const upcoming = s.filter(x => x.date >= new Date())
      setServices(upcoming.length ? upcoming : s)
      if (upcoming[0]) setServiceId(upcoming[0].id)
      else if (s[0]) setServiceId(s[0].id)
    })
  }, [open, choirId])

  const handleAdd = async () => {
    if (!serviceId) return
    setSaving(true)
    try {
      const existing = await getSetList(choirId, serviceId)
      if (!existing.some(i => i.songId === song.id)) {
        await saveSetList(choirId, serviceId, [
          ...existing,
          { songId: song.id, title: song.title, artist: song.artist, key: song.defaultKey, leadVocalist: '', notes: '', order: existing.length },
        ])
      }
      setDone(true)
      setTimeout(() => { onOpenChange(false); setDone(false) }, 1200)
    } catch (err) {
      console.error('Add to set list error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add to set list" description={`Pick a service for "${song.title}".`}>
      {done ? (
        <div className="flex flex-col items-center text-center gap-2 py-6">
          <Check size={40} className="text-harmonic-success" aria-hidden="true" />
          <p className="text-sm font-medium text-harmonic-text">Added to the set list</p>
        </div>
      ) : services.length === 0 ? (
        <p className="text-sm text-harmonic-muted py-6 text-center">
          No services yet. Create one first, then add songs to it.
        </p>
      ) : (
        <div className="space-y-4">
          <ServiceSelect services={services} value={serviceId} onValueChange={setServiceId} />
          <Button variant="primary" fullWidth onClick={handleAdd} disabled={!serviceId || saving}>
            {saving ? 'Adding…' : 'Add to set list'}
          </Button>
        </div>
      )}
    </Modal>
  )
}
