import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Music2, ChevronRight, Heart, Loader2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { AlbumArt } from '@/components/ui/AlbumArt'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { listSongs, addCustomSong, GENRES, ALL_KEYS } from '@/lib/songs'
import { fetchSpotify, type SpotifyData } from '@/lib/integrations'
import type { Song } from '@/types'

type Sort = 'recent' | 'title'
const PAGE_SIZE = 20

interface SpotifyResult {
  title: string
  artist: string
  albumArtUrl: string | null
  trackId: string | null
  keyNote: string | null
  tempo: number | null
}

export function SongLibrary() {
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const { choir, isDirector } = useChoir()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [artist, setArtist] = useState('')
  const [keyFilter, setKeyFilter] = useState('')
  const [sort, setSort] = useState<Sort>('recent')
  const [visible, setVisible] = useState(PAGE_SIZE)

  // Spotify discovery
  const [spotifyResult, setSpotifyResult] = useState<SpotifyResult | null>(null)
  const [spotifyLoading, setSpotifyLoading] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!choir) return
    let active = true
    setLoading(true)
    listSongs(choir.id)
      .then(s => { if (active) setSongs(s) })
      .catch(err => console.error('Load songs error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir])

  // Debounced Spotify search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const term = search.trim()
    if (term.length < 3) { setSpotifyResult(null); return }

    debounceRef.current = setTimeout(async () => {
      setSpotifyLoading(true)
      try {
        const data: SpotifyData | null = await fetchSpotify(term)
        if (data?.trackId) {
          setSpotifyResult({
            title: term,
            artist: '',
            albumArtUrl: data.albumArtUrl,
            trackId: data.trackId,
            keyNote: data.keyNote,
            tempo: data.tempo,
          })
        } else {
          setSpotifyResult(null)
        }
      } catch { setSpotifyResult(null) }
      finally { setSpotifyLoading(false) }
    }, 800)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const handleSaveToLibrary = async (result: SpotifyResult) => {
    if (!choir || !firebaseUser || !result.trackId) return
    setSavingId(result.trackId)
    try {
      await addCustomSong(choir.id, firebaseUser.uid, {
        title: result.title,
        artist: result.artist || undefined,
        defaultKey: result.keyNote || undefined,
      })
      setSavedIds(prev => new Set([...prev, result.trackId!]))
      const updated = await listSongs(choir.id)
      setSongs(updated)
    } catch (err) {
      console.error('Save song error:', err)
    } finally {
      setSavingId(null)
    }
  }

  const artists = useMemo(
    () => Array.from(new Set(songs.map(s => s.artist).filter(Boolean))).sort() as string[],
    [songs],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = songs.filter(s => {
      const matchSearch = !term || s.title.toLowerCase().includes(term) || (s.artist ?? '').toLowerCase().includes(term)
      const matchGenre = !genre || s.genre === genre
      const matchArtist = !artist || s.artist === artist
      const matchKey = !keyFilter || s.defaultKey === keyFilter
      return matchSearch && matchGenre && matchArtist && matchKey
    })
    if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title))
    else list.sort((a, b) => +b.createdAt - +a.createdAt)
    return list
  }, [songs, search, genre, artist, keyFilter, sort])

  const page = filtered.slice(0, visible)

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-3xl mx-auto md:px-8">
        <PageHeader
          title="Song library"
          subtitle="Find your next set"
          actions={
            isDirector ? (
              <Link to="/library/add">
                <Button variant="primary" size="sm"><Plus size={16} /> Add custom</Button>
              </Link>
            ) : undefined
          }
        />

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-harmonic-muted" aria-hidden="true" />
          <Input
            aria-label="Search songs"
            placeholder="Search library or discover on Spotify…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          <Select ariaLabel="Filter by genre" value={genre} onValueChange={setGenre}
            options={[{ value: '', label: 'All genres' }, ...GENRES.map(g => ({ value: g, label: g }))]}
            placeholder="Genre" />
          <Select ariaLabel="Filter by artist" value={artist} onValueChange={setArtist}
            options={[{ value: '', label: 'All artists' }, ...artists.map(a => ({ value: a, label: a }))]}
            placeholder="Artist" />
          <Select ariaLabel="Filter by key" value={keyFilter} onValueChange={setKeyFilter}
            options={[{ value: '', label: 'Any key' }, ...ALL_KEYS.map(k => ({ value: k, label: k }))]}
            placeholder="Key" />
          <Select ariaLabel="Sort songs" value={sort} onValueChange={v => setSort(v as Sort)}
            options={[{ value: 'recent', label: 'Recently added' }, { value: 'title', label: 'Title A–Z' }]}
            placeholder="Sort" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <>
            {/* Library results */}
            {page.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {page.map(song => (
                  <Link key={song.id} to={`/library/${song.id}`}>
                    <Card className="p-3 flex items-center gap-3 hover:shadow-card transition-shadow">
                      <AlbumArt src={song.albumArtUrl} alt={`${song.title} artwork`} className="w-14 h-14 rounded-xl flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-harmonic-text truncate">{song.title}</p>
                        <p className="text-xs text-harmonic-muted truncate">{song.artist}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {song.defaultKey && <Badge tone="muted">{song.defaultKey}</Badge>}
                          {song.genre && <Badge tone="tertiary">{song.genre}</Badge>}
                          {song.isCustom && <Badge tone="primary">Custom</Badge>}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-harmonic-muted flex-shrink-0" aria-hidden="true" />
                    </Card>
                  </Link>
                ))}
              </div>
            ) : search.trim().length < 3 ? (
              <Card className="p-2">
                <EmptyState
                  icon={Music2}
                  title="No songs match"
                  description="Try a different filter — or search by name to discover songs on Spotify."
                />
              </Card>
            ) : null}

            {visible < filtered.length && (
              <div className="flex justify-center mt-5">
                <Button variant="outlined" size="sm" onClick={() => setVisible(v => v + PAGE_SIZE)}>Load more</Button>
              </div>
            )}

            {/* Spotify discovery section */}
            {search.trim().length >= 3 && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3">
                  Discover on Spotify
                </p>

                {spotifyLoading ? (
                  <Card className="p-4 flex items-center gap-3">
                    <Loader2 size={20} className="text-harmonic-muted animate-spin" />
                    <p className="text-sm text-harmonic-muted">Searching Spotify…</p>
                  </Card>
                ) : spotifyResult ? (
                  <Card className="p-3 flex items-center gap-3">
                    <AlbumArt src={spotifyResult.albumArtUrl} alt={spotifyResult.title} className="w-14 h-14 rounded-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-harmonic-text truncate">{search.trim()}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {spotifyResult.keyNote && <Badge tone="muted">{spotifyResult.keyNote}</Badge>}
                        {spotifyResult.tempo && <Badge tone="muted">{spotifyResult.tempo} BPM</Badge>}
                        <Badge tone="tertiary">Spotify</Badge>
                      </div>
                    </div>
                    {isDirector && spotifyResult.trackId && (
                      savedIds.has(spotifyResult.trackId) ? (
                        <Button variant="secondary" size="sm" disabled>
                          <Heart size={14} className="fill-current" /> Saved
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => handleSaveToLibrary(spotifyResult)}
                          disabled={savingId === spotifyResult.trackId}
                        >
                          {savingId === spotifyResult.trackId
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Heart size={14} />}
                          Save
                        </Button>
                      )
                    )}
                    {spotifyResult.trackId && (
                      <button
                        onClick={() => navigate(`/library/spotify-${spotifyResult.trackId}`)}
                        className="text-harmonic-muted hover:text-harmonic-text"
                        aria-label="View song"
                      >
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </Card>
                ) : (
                  <Card className="p-4">
                    <p className="text-sm text-harmonic-muted text-center">No Spotify match found for "{search.trim()}"</p>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
