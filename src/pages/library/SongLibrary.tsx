import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Music2, ChevronRight, Heart, Loader2, Youtube, ExternalLink } from 'lucide-react'
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
import {
  fetchSpotifyResults,
  fetchYoutubeResults,
  type SpotifyTrackResult,
  type YoutubeVideoResult,
} from '@/lib/integrations'
import type { Song } from '@/types'

type Sort = 'recent' | 'title'
const PAGE_SIZE = 20

function fmtDuration(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

export function SongLibrary() {
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const { choir, loading: choirLoading, isDirector } = useChoir()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [artist, setArtist] = useState('')
  const [keyFilter, setKeyFilter] = useState('')
  const [sort, setSort] = useState<Sort>('recent')
  const [visible, setVisible] = useState(PAGE_SIZE)

  // External search results
  const [spotifyResults, setSpotifyResults] = useState<SpotifyTrackResult[]>([])
  const [spotifyLoading, setSpotifyLoading] = useState(false)
  const [youtubeResults, setYoutubeResults] = useState<YoutubeVideoResult[]>([])
  const [youtubeLoading, setYoutubeLoading] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (choirLoading) return
    if (!choir) { setLoading(false); return }
    let active = true
    setLoading(true)
    listSongs(choir.id)
      .then(s => { if (active) setSongs(s) })
      .catch(err => console.error('Load songs error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir, choirLoading])

  // Debounced external search (Spotify + YouTube)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const term = search.trim()
    if (term.length < 3) {
      setSpotifyResults([])
      setYoutubeResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSpotifyLoading(true)
      setYoutubeLoading(true)
      const [sp, yt] = await Promise.all([
        fetchSpotifyResults(term),
        fetchYoutubeResults(term),
      ])
      setSpotifyResults(sp)
      setSpotifyLoading(false)
      setYoutubeResults(yt)
      setYoutubeLoading(false)
    }, 800)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const handleSaveToLibrary = async (track: SpotifyTrackResult) => {
    if (!choir || !firebaseUser) return
    setSavingId(track.trackId)
    try {
      await addCustomSong(choir.id, firebaseUser.uid, {
        title: track.title,
        artist: track.artist || undefined,
      })
      setSavedIds(prev => new Set([...prev, track.trackId]))
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

  const isSearching = search.trim().length >= 3
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
            placeholder="Search library, Spotify, YouTube…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters — only shown when not in external-search mode */}
        {!isSearching && (
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
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── Your library ─────────────────────────────────── */}
            <section>
              {isSearching && (
                <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3">
                  Your library
                </p>
              )}
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
              ) : isSearching ? (
                <p className="text-sm text-harmonic-muted">No songs in your library match "{search.trim()}".</p>
              ) : (
                <Card className="p-2">
                  <EmptyState
                    icon={Music2}
                    title="No songs match"
                    description="Try a different filter — or search by name to discover songs on Spotify and YouTube."
                  />
                </Card>
              )}

              {visible < filtered.length && (
                <div className="flex justify-center mt-4">
                  <Button variant="outlined" size="sm" onClick={() => setVisible(v => v + PAGE_SIZE)}>Load more</Button>
                </div>
              )}
            </section>

            {/* ── Spotify results ───────────────────────────────── */}
            {isSearching && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Music2 size={14} className="text-[#1DB954]" />
                  <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">Spotify</p>
                </div>

                {spotifyLoading ? (
                  <Card className="p-4 flex items-center gap-3">
                    <Loader2 size={18} className="animate-spin text-harmonic-muted" />
                    <p className="text-sm text-harmonic-muted">Searching Spotify…</p>
                  </Card>
                ) : spotifyResults.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {spotifyResults.map(track => (
                      <Card key={track.trackId} className="p-3 flex items-center gap-3">
                        <AlbumArt src={track.albumArtUrl} alt={track.title} className="w-14 h-14 rounded-xl flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-harmonic-text truncate">{track.title}</p>
                          <p className="text-xs text-harmonic-muted truncate">{track.artist}</p>
                          {track.durationSec && (
                            <p className="text-xs text-harmonic-muted mt-0.5">{fmtDuration(track.durationSec)}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a
                            href={`https://open.spotify.com/track/${track.trackId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open in Spotify"
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-harmonic-surface transition-colors text-harmonic-muted hover:text-[#1DB954]"
                          >
                            <ExternalLink size={15} />
                          </a>
                          {isDirector && (
                            savedIds.has(track.trackId) ? (
                              <Button variant="secondary" size="sm" disabled>
                                <Heart size={13} className="fill-current" /> Saved
                              </Button>
                            ) : (
                              <Button
                                variant="outlined"
                                size="sm"
                                onClick={() => handleSaveToLibrary(track)}
                                disabled={savingId === track.trackId}
                              >
                                {savingId === track.trackId
                                  ? <Loader2 size={13} className="animate-spin" />
                                  : <Heart size={13} />}
                                Save
                              </Button>
                            )
                          )}
                          <button
                            onClick={() => navigate(`/library/spotify-${track.trackId}`)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-harmonic-surface transition-colors text-harmonic-muted"
                            aria-label="View song detail"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-4 text-center">
                    <p className="text-sm text-harmonic-muted">No Spotify results for "{search.trim()}"</p>
                  </Card>
                )}
              </section>
            )}

            {/* ── YouTube results ───────────────────────────────── */}
            {isSearching && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Youtube size={14} className="text-[#FF0000]" />
                  <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">YouTube</p>
                </div>

                {youtubeLoading ? (
                  <Card className="p-4 flex items-center gap-3">
                    <Loader2 size={18} className="animate-spin text-harmonic-muted" />
                    <p className="text-sm text-harmonic-muted">Searching YouTube…</p>
                  </Card>
                ) : youtubeResults.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {youtubeResults.map(video => (
                      <a
                        key={video.videoId}
                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Card className="p-3 flex items-center gap-3 hover:shadow-card transition-shadow">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-20 h-14 rounded-xl object-cover flex-shrink-0 bg-harmonic-surface"
                            />
                          ) : (
                            <div className="w-20 h-14 rounded-xl bg-harmonic-surface flex-shrink-0 flex items-center justify-center">
                              <Youtube size={20} className="text-harmonic-muted" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-sm text-harmonic-text line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: video.title }}
                            />
                            <p className="text-xs text-harmonic-muted mt-0.5 truncate">{video.channelTitle}</p>
                          </div>
                          <ExternalLink size={15} className="text-harmonic-muted flex-shrink-0" />
                        </Card>
                      </a>
                    ))}
                  </div>
                ) : (
                  <Card className="p-4 text-center">
                    <p className="text-sm text-harmonic-muted">
                      YouTube search not available.{' '}
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(search.trim())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-harmonic-primary underline"
                      >
                        Search on YouTube ↗
                      </a>
                    </p>
                  </Card>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
