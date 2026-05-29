import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink, Plus, Check, ChevronUp, ChevronDown, Save } from 'lucide-react'
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
          <div className="space-y-4">
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

                {/* Key transposer */}
                <div>
                  <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3">Key & chords</p>
                  <div className="flex items-center gap-4 mb-3">
                    <button
                      onClick={() => setSelectedKey(k => transposeKey(k, -1))}
                      className="w-9 h-9 rounded-full bg-harmonic-surface flex items-center justify-center hover:bg-harmonic-border transition-colors"
                      aria-label="Transpose down"
                    >
                      <ChevronDown size={18} className="text-harmonic-text" />
                    </button>
                    <div className="flex-1 text-center">
                      <p className="text-3xl font-bold text-harmonic-primary">{selectedKey}</p>
                      {song.defaultKey && toChromaticKey(song.defaultKey) !== selectedKey && (
                        <p className="text-xs text-harmonic-muted mt-0.5">
                          Original: {song.defaultKey}
                          {' · '}
                          <button
                            className="underline hover:no-underline"
                            onClick={() => setSelectedKey(toChromaticKey(song.defaultKey!))}
                          >
                            Reset
                          </button>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedKey(k => transposeKey(k, 1))}
                      className="w-9 h-9 rounded-full bg-harmonic-surface flex items-center justify-center hover:bg-harmonic-border transition-colors"
                      aria-label="Transpose up"
                    >
                      <ChevronUp size={18} className="text-harmonic-text" />
                    </button>
                  </div>

                  {/* Common chords */}
                  {chords && (
                    <div className="grid grid-cols-4 gap-2">
                      {(['I', 'IV', 'V', 'vi'] as const).map((numeral, i) => (
                        <div key={numeral} className="flex flex-col items-center bg-harmonic-surface rounded-xl py-2.5 px-1">
                          <p className="text-[10px] font-semibold text-harmonic-muted uppercase tracking-widest">{numeral}</p>
                          <p className="text-sm font-bold text-harmonic-text mt-0.5">{chords[i]}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* All keys quick-select */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
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
                </div>

                {mediaError && (
                  <div className="bg-harmonic-surface rounded-xl px-4 py-3 text-sm text-harmonic-muted">
                    Song details couldn't load. You can still use the song.
                  </div>
                )}

                {trackId ? (
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

                <div className="flex flex-col gap-2">
                  {lyricsUrl && (
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

                <UsageHistory choirId={choir!.id} songId={song.id} />
              </div>
            </Card>

            {/* Practice notes */}
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
