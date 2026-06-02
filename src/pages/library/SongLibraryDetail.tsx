import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Plus, Check, ChevronUp, ChevronDown, Save,
  Music2, Youtube, ExternalLink, ChevronDown as ChevronExpand,
  Sparkles, Pencil, Trash2, RotateCcw, Lock, Unlock, Archive, ArchiveRestore,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ServiceSelect } from '@/components/ServiceSelect'
import { LyricSheet } from '@/components/LyricSheet'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { getSong, getPracticeNotes, savePracticeNotes, updateCustomSong, deleteCustomSong, subscribeSongOverride, saveSongOverride, ALL_KEYS, GENRES } from '@/lib/songs'
import type { SongOverride } from '@/types'
import {
  fetchSpotify, fetchGenius, fetchLyricsData, fetchSongContext,
  spotifyEmbedUrl,
  type SpotifyData, type GeniusData, type LyricsData, type SongContextData,
} from '@/lib/integrations'
import { listServices, getSetList, saveSetList } from '@/lib/firestore'
import { semitoneDelta, inferPreference } from '@/lib/transpose'
import type { Song, Service } from '@/types'

// ── Key / chord utilities ─────────────────────────────────────────────────────
const CHROMATIC = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const KEY_CHORDS: Record<string, [string, string, string, string]> = {
  'C':  ['C',  'F',  'G',  'Am'], 'C#': ['C#', 'F#', 'G#', 'A#m'],
  'D':  ['D',  'G',  'A',  'Bm'], 'Eb': ['Eb', 'Ab', 'Bb', 'Cm'],
  'E':  ['E',  'A',  'B',  'C#m'], 'F': ['F',  'Bb', 'C',  'Dm'],
  'F#': ['F#', 'B',  'C#', 'D#m'], 'G': ['G',  'C',  'D',  'Em'],
  'Ab': ['Ab', 'Db', 'Eb', 'Fm'], 'A':  ['A',  'D',  'E',  'F#m'],
  'Bb': ['Bb', 'Eb', 'F',  'Gm'], 'B':  ['B',  'E',  'F#', 'G#m'],
}

function toChromaticKey(k: string): string {
  return ({ Db: 'C#', 'D#': 'Eb', Gb: 'F#', 'G#': 'Ab', 'A#': 'Bb' } as Record<string, string>)[k] ?? k
}
function transposeKey(key: string, semitones: number): string {
  const idx = CHROMATIC.indexOf(toChromaticKey(key))
  if (idx === -1) return key
  return CHROMATIC[((idx + semitones) % 12 + 12) % 12]
}
function fmtDuration(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SongLibraryDetail() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const { choir, isDirector } = useChoir()

  const [song,    setSong]    = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [spotify, setSpotify] = useState<SpotifyData | null>(null)
  const [genius,  setGenius]  = useState<GeniusData | null>(null)
  const [lyricsData,  setLyricsData]  = useState<LyricsData | null>(null)
  const [context, setContext] = useState<SongContextData | null>(null)
  const [mediaLoading,   setMediaLoading]   = useState(true)
  const [lyricsLoading,  setLyricsLoading]  = useState(true)
  const [contextLoading, setContextLoading] = useState(true)
  const [lyricsExpanded, setLyricsExpanded] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  // Edit / delete (custom songs, director only)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editArtist, setEditArtist] = useState('')
  const [editKey, setEditKey] = useState('')
  const [editGenre, setEditGenre] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Key transposer
  const [selectedKey, setSelectedKey] = useState('')
  const [transposeDelta, setTransposeDelta] = useState(0)

  // Song override (per-choir)
  const [override, setOverride] = useState<SongOverride | null>(null)
  const [overrideSaving, setOverrideSaving] = useState(false)

  // Practice notes
  const [notes,       setNotes]       = useState('')
  const [notesLoading, setNotesLoading] = useState(false)
  const [notesSaving,  setNotesSaving]  = useState(false)
  const [notesSaved,   setNotesSaved]   = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load song then fire all enrichment fetches in parallel
  useEffect(() => {
    if (!choir || !songId) return
    let active = true
    setLoading(true)
    setMediaLoading(true)
    setLyricsLoading(true)
    setContextLoading(true)

    getSong(choir.id, songId).then(async s => {
      if (!active) return
      setSong(s)
      if (!s) { setLoading(false); return }

      setSelectedKey(toChromaticKey(s.defaultKey ?? 'C'))
      setLoading(false)

      // Fire all enrichment in parallel — each settles independently
      const [sp, ge, ly, ctx] = await Promise.allSettled([
        fetchSpotify(s.title, s.artist),
        fetchGenius(s.title, s.artist),
        fetchLyricsData(s.title, s.artist),
        fetchSongContext(s.title, s.artist),
      ])

      if (!active) return
      if (sp.status === 'fulfilled') setSpotify(sp.value)
      setMediaLoading(false)

      if (ge.status === 'fulfilled') setGenius(ge.value)

      if (ly.status === 'fulfilled') setLyricsData(ly.value)
      setLyricsLoading(false)

      if (ctx.status === 'fulfilled') setContext(ctx.value)
      setContextLoading(false)
    }).catch(err => {
      console.error('Load song error:', err)
      setLoading(false)
      setMediaLoading(false)
      setLyricsLoading(false)
      setContextLoading(false)
    })

    return () => { active = false }
  }, [choir, songId])

  // Song override subscription (real-time)
  useEffect(() => {
    if (!choir || !songId) return
    return subscribeSongOverride(choir.id, songId, setOverride)
  }, [choir, songId])

  // When override has a performanceKey, apply it as the selected key
  useEffect(() => {
    if (override?.performanceKey && override.keyLocked) {
      const chromatic = toChromaticKey(override.performanceKey)
      setSelectedKey(chromatic)
      if (song?.defaultKey) {
        setTransposeDelta(semitoneDelta(toChromaticKey(song.defaultKey), chromatic))
      }
    }
  }, [override?.performanceKey, override?.keyLocked, song?.defaultKey])

  // Practice notes
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

  const handleOverrideSave = async (input: Parameters<typeof saveSongOverride>[3]) => {
    if (!choir || !songId || !firebaseUser) return
    setOverrideSaving(true)
    try {
      await saveSongOverride(choir.id, songId, firebaseUser.uid, input)
    } catch (err) {
      console.error('Save override error:', err)
    } finally {
      setOverrideSaving(false)
    }
  }

  const handleToggleKeyLock = () => {
    const newLocked = !override?.keyLocked
    handleOverrideSave({
      keyLocked: newLocked,
      ...(newLocked ? { performanceKey: selectedKey } : {}),
    })
  }

  const handleToggleArchive = () => {
    handleOverrideSave({ archived: !override?.archived })
  }

  const keyIsLocked = override?.keyLocked ?? false

  const trackId  = spotify?.trackId  ?? song?.spotifyTrackId ?? null
  const artUrl   = spotify?.albumArtUrl ?? song?.albumArtUrl ?? null
  const lyricsUrl = genius?.url ?? song?.geniusUrl ?? song?.lyricsUrl ?? null
  const lyrics   = lyricsData?.lyrics ?? null
  const chords   = KEY_CHORDS[selectedKey] ?? null
  const songQuery = encodeURIComponent(`${song?.title ?? ''} ${song?.artist ?? ''}`.trim())

  const openEdit = () => {
    if (!song) return
    setEditTitle(song.title)
    setEditArtist(song.artist ?? '')
    setEditKey(song.defaultKey ?? '')
    setEditGenre(song.genre ?? '')
    setEditNotes(song.notes ?? '')
    setEditError(null)
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!choir || !songId || !editTitle.trim()) return
    setEditSaving(true)
    setEditError(null)
    try {
      await updateCustomSong(choir.id, songId, {
        title: editTitle.trim(),
        artist: editArtist.trim() || undefined,
        defaultKey: editKey || undefined,
        genre: editGenre as Song['genre'] || undefined,
        notes: editNotes.trim() || undefined,
      })
      setSong(prev => prev ? { ...prev, title: editTitle.trim(), artist: editArtist.trim() || undefined, defaultKey: editKey || undefined, genre: editGenre as Song['genre'] || undefined, notes: editNotes.trim() || undefined } : prev)
      setEditOpen(false)
    } catch {
      setEditError('Save failed. Please try again.')
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!choir || !songId) return
    setDeleting(true)
    try {
      await deleteCustomSong(choir.id, songId)
      navigate('/library', { replace: true })
    } catch {
      setDeleting(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="h-72 bg-harmonic-surface" />
          <div className="px-5 py-5 space-y-3">
            <div className="h-44 bg-harmonic-surface rounded-2xl" />
            <div className="h-5 bg-harmonic-surface rounded-full w-2/3" />
            <div className="h-4 bg-harmonic-surface rounded-full w-1/2" />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!song) {
    return (
      <AppLayout>
        <div className="px-6 py-8 max-w-2xl mx-auto">
          <Link to="/library" className="inline-flex items-center gap-1.5 text-sm text-harmonic-muted mb-6 hover:text-harmonic-text">
            <ArrowLeft size={16} /> Library
          </Link>
          <Card className="p-2">
            <EmptyState title="Song not found" description="It may have been removed from the library." />
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto pb-12">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div className="relative h-72 sm:h-80 overflow-hidden select-none">
          {artUrl ? (
            <img
              src={artUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-[32px] brightness-[0.38] saturate-[1.5]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-harmonic-primary via-harmonic-secondary to-purple-900" />
          )}
          {/* Gradient fade to page bg */}
          <div className="absolute inset-0 bg-gradient-to-t from-harmonic-background/95 via-black/10 to-black/30" />

          {/* Back */}
          <Link
            to="/library"
            className="absolute top-safe-top top-5 left-5 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors"
            aria-label="Back to library"
          >
            <ArrowLeft size={17} />
          </Link>

          {/* Content anchored to bottom */}
          <div className="absolute inset-x-0 bottom-0 px-5 pb-6 z-10 flex items-end gap-4">
            {artUrl && (
              <img
                src={artUrl}
                alt={`${song.title} artwork`}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-2xl flex-shrink-0 ring-1 ring-white/15"
              />
            )}
            <div className="flex-1 min-w-0 pb-0.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{song.title}</h1>
              <p className="text-sm text-white/65 mt-0.5 truncate">
                {spotify?.artistName ?? song.artist}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {song.genre && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white backdrop-blur-sm">
                    {song.genre}
                  </span>
                )}
                {spotify?.tempo && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white backdrop-blur-sm">
                    {spotify.tempo} BPM
                  </span>
                )}
                {song.isCustom && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-harmonic-primary/70 text-white">
                    Custom
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 space-y-4 mt-3">

          {/* ── Spotify in-app player ───────────────────────────────────── */}
          {mediaLoading ? (
            <Skeleton className="h-[152px] w-full rounded-2xl" />
          ) : trackId ? (
            <div className="space-y-1">
              <iframe
                title={`Play ${song.title} on Spotify`}
                src={spotifyEmbedUrl(trackId)}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-2xl shadow-card"
              />
              <div className="flex items-center justify-center gap-4 pt-1">
                <a
                  href={`https://open.spotify.com/track/${trackId}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-harmonic-muted hover:text-harmonic-text transition-colors"
                >
                  <Music2 size={12} className="text-[#1DB954]" /> Open in Spotify
                </a>
                <span className="text-harmonic-border">·</span>
                <a
                  href={`https://www.youtube.com/results?search_query=${songQuery}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-harmonic-muted hover:text-harmonic-text transition-colors"
                >
                  <Youtube size={12} className="text-[#FF0000]" /> Search YouTube
                </a>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <a href={`https://open.spotify.com/search/${songQuery}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outlined" fullWidth>
                  <Music2 size={15} className="text-[#1DB954]" /> Search Spotify
                </Button>
              </a>
              <a href={`https://www.youtube.com/results?search_query=${songQuery}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outlined" fullWidth>
                  <Youtube size={15} className="text-[#FF0000]" /> Search YouTube
                </Button>
              </a>
            </div>
          )}

          {/* ── Archived banner ─────────────────────────────────────────── */}
          {override?.archived && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <Archive size={16} className="flex-shrink-0" />
              <span>This song is archived for your choir.</span>
              {isDirector && (
                <button
                  onClick={handleToggleArchive}
                  disabled={overrideSaving}
                  className="ml-auto text-xs font-semibold text-amber-700 hover:underline"
                >
                  Restore
                </button>
              )}
            </div>
          )}

          {/* ── Director actions ────────────────────────────────────────── */}
          {isDirector && (
            <div className="space-y-2">
              <Button variant="primary" fullWidth onClick={() => setAddOpen(true)}>
                <Plus size={15} /> Add to set list
              </Button>
              <div className="flex gap-2">
                <Button
                  variant={keyIsLocked ? 'secondary' : 'outlined'}
                  fullWidth
                  onClick={handleToggleKeyLock}
                  disabled={overrideSaving}
                >
                  {keyIsLocked ? <Lock size={15} /> : <Unlock size={15} />}
                  {keyIsLocked ? 'Key locked' : 'Lock key for choir'}
                </Button>
                {!override?.archived && (
                  <Button variant="outlined" fullWidth onClick={handleToggleArchive} disabled={overrideSaving}>
                    <Archive size={15} /> Archive
                  </Button>
                )}
                {override?.archived && (
                  <Button variant="outlined" fullWidth onClick={handleToggleArchive} disabled={overrideSaving}>
                    <ArchiveRestore size={15} /> Restore
                  </Button>
                )}
              </div>
              {song.isCustom && (
                <div className="flex gap-2">
                  <Button variant="outlined" fullWidth onClick={openEdit}>
                    <Pencil size={15} /> Edit song
                  </Button>
                  <Button variant="danger" fullWidth onClick={() => setDeleteOpen(true)}>
                    <Trash2 size={15} /> Delete
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── AI Knowledge card ───────────────────────────────────────── */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-harmonic-primary" />
              <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">About this song</p>
            </div>

            {contextLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            ) : context?.about ? (
              <div className="space-y-3">
                <p className="text-sm text-harmonic-text leading-relaxed">{context.about}</p>
                {context.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {context.themes.map(theme => (
                      <Badge key={theme} tone="tertiary">{theme}</Badge>
                    ))}
                  </div>
                )}
                {context.resonance && (
                  <p className="text-xs text-harmonic-muted italic border-l-2 border-harmonic-primary/30 pl-3">
                    {context.resonance}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-harmonic-muted">No context available for this song.</p>
            )}
          </Card>

          {/* ── Lyrics ──────────────────────────────────────────────────── */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-4">Lyrics</p>

            {/* Structured lyrics via LyricSheet (rev-2 schema) */}
            {song.lyrics && song.lyrics.length > 0 ? (
              <LyricSheet
                sections={song.lyrics}
                translations={song.translations}
                showChords
                transposeDelta={transposeDelta}
                accidentalPreference={inferPreference(selectedKey)}
              />
            ) : lyricsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className={`h-4 ${i % 4 === 3 ? 'w-1/3' : i % 2 === 0 ? 'w-full' : 'w-5/6'}`} />
                ))}
              </div>
            ) : lyrics ? (
              <div className="relative">
                <div
                  className={`overflow-hidden transition-all duration-500 ${lyricsExpanded ? 'max-h-[9999px]' : 'max-h-72'}`}
                >
                  <pre className="text-sm text-harmonic-text whitespace-pre-wrap font-sans leading-7">
                    {lyrics}
                  </pre>
                </div>
                {!lyricsExpanded && (
                  <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
                <button
                  onClick={() => setLyricsExpanded(e => !e)}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-harmonic-primary hover:underline"
                >
                  <ChevronExpand size={14} className={`transition-transform ${lyricsExpanded ? 'rotate-180' : ''}`} />
                  {lyricsExpanded ? 'Show less' : 'Show full lyrics'}
                </button>
                {lyricsUrl && (
                  <a
                    href={lyricsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1 text-xs text-harmonic-muted hover:text-harmonic-text transition-colors"
                  >
                    <ExternalLink size={11} /> Full lyrics on Genius
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-harmonic-muted mb-3">Lyrics not available in-app for this song.</p>
                {lyricsUrl && (
                  <a href={lyricsUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outlined" fullWidth>
                      <ExternalLink size={15} /> View lyrics on Genius
                    </Button>
                  </a>
                )}
              </div>
            )}
          </Card>

          {/* ── Song info grid ───────────────────────────────────────────── */}
          {(spotify?.albumName || spotify?.releaseYear || spotify?.tempo || spotify?.keyNote) && (
            <Card className="p-5">
              <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-4">Song info</p>
              <div className="grid grid-cols-2 gap-3">
                {spotify.albumName && (
                  <InfoCell label="Album" value={spotify.albumName} />
                )}
                {spotify.releaseYear && (
                  <InfoCell label="Year" value={String(spotify.releaseYear)} />
                )}
                {spotify.tempo && (
                  <InfoCell label="Tempo" value={`${spotify.tempo} BPM`} />
                )}
                {spotify.keyNote && (
                  <InfoCell label="Key (Spotify)" value={spotify.keyNote} />
                )}
                {spotify.durationSec && (
                  <InfoCell label="Duration" value={fmtDuration(spotify.durationSec)} />
                )}
              </div>
            </Card>
          )}

          {/* ── Key & chords ────────────────────────────────────────────── */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">Key & chords</p>
              {keyIsLocked && !isDirector && (
                <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                  <Lock size={12} /> Key locked by director
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Transpose down — hidden for members when locked */}
              {(isDirector || !keyIsLocked) ? (
                <button
                  onClick={() => {
                    setSelectedKey(k => transposeKey(k, -1))
                    setTransposeDelta(d => d - 1)
                  }}
                  className="w-10 h-10 rounded-full bg-harmonic-surface flex items-center justify-center hover:bg-harmonic-border transition-colors"
                  aria-label="Transpose down"
                >
                  <ChevronDown size={18} />
                </button>
              ) : <div className="w-10" />}

              <div className="flex-1 text-center">
                <p className="text-4xl font-bold text-harmonic-primary">{selectedKey}</p>
                {song.defaultKey && toChromaticKey(song.defaultKey) !== selectedKey && (
                  <p className="text-xs text-harmonic-muted mt-1">
                    Original: {song.defaultKey}{' · '}
                    {transposeDelta !== 0 && (
                      <span className="text-harmonic-primary font-medium">
                        {transposeDelta > 0 ? `+${transposeDelta}` : transposeDelta}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Transpose up — hidden for members when locked */}
              {(isDirector || !keyIsLocked) ? (
                <button
                  onClick={() => {
                    setSelectedKey(k => transposeKey(k, 1))
                    setTransposeDelta(d => d + 1)
                  }}
                  className="w-10 h-10 rounded-full bg-harmonic-surface flex items-center justify-center hover:bg-harmonic-border transition-colors"
                  aria-label="Transpose up"
                >
                  <ChevronUp size={18} />
                </button>
              ) : <div className="w-10" />}
            </div>

            {/* Reset to default key — hidden for members when locked */}
            {transposeDelta !== 0 && song.defaultKey && (isDirector || !keyIsLocked) && (
              <button
                onClick={() => {
                  setSelectedKey(toChromaticKey(song.defaultKey!))
                  setTransposeDelta(0)
                }}
                className="flex items-center gap-1.5 mx-auto text-xs font-medium text-harmonic-primary hover:underline"
              >
                <RotateCcw size={12} /> Reset to default key
              </button>
            )}

            {chords && (
              <div className="grid grid-cols-4 gap-2">
                {(['I', 'IV', 'V', 'vi'] as const).map((numeral, i) => (
                  <div key={numeral} className="flex flex-col items-center bg-harmonic-surface rounded-xl py-3">
                    <p className="text-[10px] font-semibold text-harmonic-muted uppercase tracking-widest">{numeral}</p>
                    <p className="text-sm font-bold text-harmonic-text mt-0.5">{chords[i]}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Chromatic key selector — hidden for members when locked */}
            {(isDirector || !keyIsLocked) && (
              <div className="flex flex-wrap gap-1.5">
                {CHROMATIC.map(k => {
                  const delta = semitoneDelta(toChromaticKey(song.defaultKey ?? 'C'), k)
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        setSelectedKey(k)
                        setTransposeDelta(delta)
                      }}
                      className={
                        selectedKey === k
                          ? 'px-2.5 py-1 rounded-full text-xs font-semibold bg-harmonic-primary text-white'
                          : 'px-2.5 py-1 rounded-full text-xs font-medium bg-harmonic-surface text-harmonic-muted hover:bg-harmonic-border transition-colors'
                      }
                    >
                      {k}
                    </button>
                  )
                })}
              </div>
            )}
          </Card>

          {/* ── Usage history ────────────────────────────────────────────── */}
          <Card className="px-5 py-4">
            <UsageHistory choirId={choir!.id} songId={song.id} />
          </Card>

          {/* ── Practice notes ───────────────────────────────────────────── */}
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

      {song && choir && (
        <AddToSetListModal open={addOpen} onOpenChange={setAddOpen} choirId={choir.id} song={song} />
      )}

      {/* Edit modal (custom songs only) */}
      <Modal
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit song"
        footer={
          <>
            <Button variant="outlined" onClick={() => setEditOpen(false)} disabled={editSaving}>Cancel</Button>
            <Button variant="primary" onClick={handleEditSave} disabled={!editTitle.trim() || editSaving}>
              {editSaving ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
          <Input label="Artist" value={editArtist} onChange={e => setEditArtist(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Key" value={editKey} onValueChange={setEditKey}
              options={ALL_KEYS.map(k => ({ value: k, label: k }))} placeholder="Key…" />
            <Select label="Genre" value={editGenre} onValueChange={setEditGenre}
              options={GENRES.map(g => ({ value: g, label: g }))} placeholder="Genre…" />
          </div>
          <Input label="Notes" value={editNotes} onChange={e => setEditNotes(e.target.value)} />
          {editError && <p role="alert" className="text-sm text-harmonic-danger">{editError}</p>}
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${song?.title}"?`}
        description="This removes the song from your choir's library. It cannot be undone."
        footer={
          <>
            <Button variant="outlined" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete song'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-harmonic-muted">
          This only removes the custom song from {choir?.name}. Global songs cannot be deleted.
        </p>
      </Modal>
    </AppLayout>
  )
}

// ── Info cell ─────────────────────────────────────────────────────────────────
function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-harmonic-surface rounded-xl px-4 py-3">
      <p className="text-[10px] font-semibold text-harmonic-muted uppercase tracking-widest">{label}</p>
      <p className="text-sm font-semibold text-harmonic-text mt-0.5 truncate">{value}</p>
    </div>
  )
}

// ── Usage history ─────────────────────────────────────────────────────────────
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
    <div>
      <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-1">Usage history</p>
      {loading ? (
        <Skeleton className="h-4 w-2/3" />
      ) : last ? (
        <p className="text-sm text-harmonic-text">
          Last used at <span className="font-medium">{last.title}</span>
          {' · '}
          {last.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      ) : (
        <p className="text-sm text-harmonic-muted">Not used in a service yet.</p>
      )}
    </div>
  )
}

// ── Add to set list modal ─────────────────────────────────────────────────────
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
          <Check size={40} className="text-harmonic-success" />
          <p className="text-sm font-medium text-harmonic-text">Added to the set list</p>
        </div>
      ) : services.length === 0 ? (
        <p className="text-sm text-harmonic-muted py-6 text-center">No services yet. Create one first.</p>
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
