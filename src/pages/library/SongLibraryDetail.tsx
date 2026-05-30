import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink, Plus, Check, ChevronUp, ChevronDown, Save, Music2, Youtube, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ServiceSelect } from '@/components/ServiceSelect'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { getSong, getPracticeNotes, savePracticeNotes } from '@/lib/songs'
import { fetchSpotify, fetchGenius, spotifyEmbedUrl, type SpotifyData, type GeniusData } from '@/lib/integrations'
import { listServices, getSetList, saveSetList } from '@/lib/firestore'
import type { Song, Service } from '@/types'

// 12-note chromatic scale for transposing
const CHROMATIC = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

// Common chord sets (I, IV, V, vi) per key — useful for musicians
const KEY_CHORDS: Record<string, [string, string, string, string]> = {
  'C':  ['C',  'F',  'G',  'Am'],
  'C#': ['C#', 'F#', 'G#', 'A#m'],
  'D':  ['D',  'G',  'A',  'Bm'],
  'Eb': ['Eb', 'Ab', 'Bb', 'Cm'],
  'E':  ['E',  'A',  'B',  'C#m'],
  'F':  ['F',  'Bb', 'C',  'Dm'],
  'F#': ['F#', 'B',  'C#', 'D#m'],
  'G':  ['G',  'C',  'D',  'Em'],
  'Ab': ['Ab', 'Db', 'Eb', 'Fm'],
  'A':  ['A',  'D',  'E',  'F#m'],
  'Bb': ['Bb', 'Eb', 'F',  'Gm'],
  'B':  ['B',  'E',  'F#', 'G#m'],
}

// Map ALL_KEYS values to nearest chromatic equivalent
function toChromaticKey(k: string): string {
  const map: Record<string, string> = {
    'Db': 'C#', 'D#': 'Eb', 'Gb': 'F#', 'G#': 'Ab', 'A#': 'Bb',
  }
  return map[k] ?? k
}

function transposeKey(key: string, semitones: number): string {
  const base = toChromaticKey(key)
  const idx = CHROMATIC.indexOf(base)
  if (idx === -1) return key
  return CHROMATIC[((idx + semitones) % 12 + 12) % 12]
}

export function SongLibraryDetail() {
  const { songId } = useParams<{ songId: string }>()
  const { firebaseUser } = useAuth()
  const { choir, isDirector } = useChoir()
  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [spotify, setSpotify] = useState<SpotifyData | null>(null)
  const [genius, setGenius] = useState<GeniusData | null>(null)
  const [mediaError, setMediaError] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  // Key transposer
  const [selectedKey, setSelectedKey] = useState<string>('')

  // Practice notes
  const [notes, setNotes] = useState('')
  const [notesLoading, setNotesLoading] = useState(false)
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!choir || !songId) return
    let active = true
    setLoading(true)
    getSong(choir.id, songId)
      .then(async s => {
        if (!active) return
        setSong(s)
        if (s) {
          setSelectedKey(toChromaticKey(s.defaultKey ?? 'C'))
          const [sp, ge] = await Promise.all([
            fetchSpotify(s.title, s.artist),
            fetchGenius(s.title, s.artist),
          ])
          if (!active) return
          setSpotify(sp)
          setGenius(ge)
          if (!sp && !ge) setMediaError(true)
        }
      })
      .catch(err => console.error('Load song error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir, songId])

  // Load practice notes
  useEffect(() => {
    if (!choir || !songId || !firebaseUser) return
    let active = true
    setNotesLoading(true)
    getPracticeNotes(choir.id, songId, firebaseUser.uid)
      .then(n => { if (active) setNotes(n) })
      .catch(() => {})
      .finally(() => { if (active) setNotesLoading(false) })
    return () => { active = false }
  }, [choir, songId, firebaseUser])

  const handleNotesChange = (val: string) => {
    setNotes(val)
    setNotesSaved(false)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      if (!choir || !songId || !firebaseUser) return
      setNotesSaving(true)
      try {
        await savePracticeNotes(choir.id, songId, firebaseUser.uid, val)
        setNotesSaved(true)
      } catch (err) {
        console.error('Save notes error:', err)
      } finally {
        setNotesSaving(false)
      }
    }, 1000)
  }

  const lyricsUrl = genius?.url ?? song?.geniusUrl ?? song?.lyricsUrl ?? null
  const trackId = spotify?.trackId ?? song?.spotifyTrackId ?? null
  const artUrl = spotify?.albumArtUrl ?? song?.albumArtUrl ?? null
  const chords = KEY_CHORDS[selectedKey] ?? null

  const songQuery = encodeURIComponent(`${song?.title ?? ''} ${song?.artist ?? ''}`.trim())

  return (
    <AppLayout>
      {loading ? (
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-72 w-full" />
          <div className="px-6 py-6 space-y-4">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
        </div>
      ) : !song ? (
        <div className="px-6 py-8 max-w-2xl mx-auto">
          <PageHeader title="Song" back="/library" />
          <Card className="p-2"><EmptyState title="Song not found" description="It may have been removed from the library." /></Card>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto pb-10">

          {/* ── Hero banner ──────────────────────────────────────── */}
          <div className="relative h-72 overflow-hidden">
            {/* Blurred wallpaper background */}
            {artUrl ? (
              <img
                src={artUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-110"
                style={{ filter: 'blur(28px) brightness(0.45) saturate(1.4)' }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-harmonic-primary/80 to-purple-900" />
            )}
            {/* Bottom gradient fade into page */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Back button */}
            <Link
              to="/library"
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
              aria-label="Back to library"
            >
              <ArrowLeft size={18} />
            </Link>

            {/* Floating album art + text */}
            <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 px-5 pb-5 z-10">
              {artUrl && (
                <img
                  src={artUrl}
                  alt={`${song.title} artwork`}
                  className="w-24 h-24 rounded-2xl object-cover shadow-2xl flex-shrink-0 border border-white/10"
                />
              )}
              <div className="flex-1 min-w-0 pb-1">
                <h2 className="text-xl font-bold text-white leading-tight truncate">{song.title}</h2>
                {song.artist && <p className="text-sm text-white/70 mt-0.5 truncate">{song.artist}</p>}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {song.genre && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                      {song.genre}
                    </span>
                  )}
                  {spotify?.tempo && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                      {spotify.tempo} BPM
                    </span>
                  )}
                  {song.isCustom && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-harmonic-primary/80 text-white">
                      Custom
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 space-y-4 mt-4">

            {/* ── Spotify in-app player ─────────────────────────── */}
            <div className="space-y-2">
              {trackId ? (
                <>
                  <iframe
                    title={`Play ${song.title} on Spotify`}
                    src={`${spotifyEmbedUrl(trackId)}?utm_source=generator&theme=0`}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-2xl shadow-md"
                  />
                  <a
                    href={`https://open.spotify.com/track/${trackId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 text-xs text-harmonic-muted hover:text-harmonic-text transition-colors"
                  >
                    <Music2 size={12} className="text-[#1DB954]" /> Open full song in Spotify
                  </a>
                </>
              ) : (
                <div className="flex gap-2">
                  <a
                    href={`https://open.spotify.com/search/${songQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outlined" fullWidth>
                      <Music2 size={15} className="text-[#1DB954]" /> Search Spotify
                    </Button>
                  </a>
                  <a
                    href={`https://www.youtube.com/results?search_query=${songQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outlined" fullWidth>
                      <Youtube size={15} className="text-[#FF0000]" /> Search YouTube
                    </Button>
                  </a>
                </div>
              )}

              {/* YouTube search always available as secondary action when Spotify loaded */}
              {trackId && (
                <a
                  href={`https://www.youtube.com/results?search_query=${songQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 text-xs text-harmonic-muted hover:text-harmonic-text transition-colors"
                >
                  <Youtube size={12} className="text-[#FF0000]" /> Search on YouTube
                </a>
              )}
            </div>

            {/* ── Actions ───────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              {lyricsUrl && (
                <a href={lyricsUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outlined" fullWidth>
                    <ExternalLink size={15} /> View lyrics on Genius
                  </Button>
                </a>
              )}
              {isDirector && (
                <Button variant="primary" fullWidth onClick={() => setAddOpen(true)}>
                  <Plus size={15} /> Add to set list
                </Button>
              )}
            </div>

            {/* ── Key & chords ──────────────────────────────────── */}
            <Card className="p-5 space-y-4">
              <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">Key & chords</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedKey(k => transposeKey(k, -1))}
                  className="w-10 h-10 rounded-full bg-harmonic-surface flex items-center justify-center hover:bg-harmonic-border transition-colors"
                  aria-label="Transpose down"
                >
                  <ChevronDown size={18} className="text-harmonic-text" />
                </button>
                <div className="flex-1 text-center">
                  <p className="text-4xl font-bold text-harmonic-primary">{selectedKey}</p>
                  {song.defaultKey && toChromaticKey(song.defaultKey) !== selectedKey && (
                    <p className="text-xs text-harmonic-muted mt-1">
                      Original: {song.defaultKey}
                      {' · '}
                      <button className="underline hover:no-underline" onClick={() => setSelectedKey(toChromaticKey(song.defaultKey!))}>
                        Reset
                      </button>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedKey(k => transposeKey(k, 1))}
                  className="w-10 h-10 rounded-full bg-harmonic-surface flex items-center justify-center hover:bg-harmonic-border transition-colors"
                  aria-label="Transpose up"
                >
                  <ChevronUp size={18} className="text-harmonic-text" />
                </button>
              </div>

              {chords && (
                <div className="grid grid-cols-4 gap-2">
                  {(['I', 'IV', 'V', 'vi'] as const).map((numeral, i) => (
                    <div key={numeral} className="flex flex-col items-center bg-harmonic-surface rounded-xl py-3 px-1">
                      <p className="text-[10px] font-semibold text-harmonic-muted uppercase tracking-widest">{numeral}</p>
                      <p className="text-sm font-bold text-harmonic-text mt-0.5">{chords[i]}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {CHROMATIC.map(k => (
                  <button
                    key={k}
                    onClick={() => setSelectedKey(k)}
                    className={
                      selectedKey === k
                        ? 'px-2.5 py-1 rounded-pill text-xs font-semibold bg-harmonic-primary text-white'
                        : 'px-2.5 py-1 rounded-pill text-xs font-medium bg-harmonic-surface text-harmonic-muted hover:bg-harmonic-border transition-colors'
                    }
                  >
                    {k}
                  </button>
                ))}
              </div>
            </Card>

            {/* ── Usage history ─────────────────────────────────── */}
            <Card className="px-5 py-4">
              <UsageHistory choirId={choir!.id} songId={song.id} />
            </Card>

            {/* ── Practice notes ────────────────────────────────── */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">My practice notes</p>
                <span className="text-xs text-harmonic-muted flex items-center gap-1">
                  {notesSaving
                    ? <><Save size={12} className="animate-pulse" /> Saving…</>
                    : notesSaved
                    ? <><Check size={12} className="text-harmonic-success" /> Saved</>
                    : null}
                </span>
              </div>
              {notesLoading ? (
                <Skeleton className="h-24 w-full rounded-xl" />
              ) : (
                <textarea
                  value={notes}
                  onChange={e => handleNotesChange(e.target.value)}
                  placeholder="Add your own notes — key tips, chord changes, cues, anything that helps you prepare…"
                  rows={4}
                  className="w-full resize-none rounded-xl bg-harmonic-surface border border-harmonic-border px-4 py-3 text-sm text-harmonic-text placeholder-harmonic-muted focus:outline-none focus:ring-2 focus:ring-harmonic-primary/30 transition"
                />
              )}
            </Card>
          </div>
        </div>
      )}

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
