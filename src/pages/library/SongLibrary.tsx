import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Music2, ChevronRight, Heart, Loader2, Youtube, ExternalLink, Archive, WifiOff } from 'lucide-react'
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
import { useOfflineSongs } from '@/hooks/useOfflineSongs'
import { subscribeSongs, addCustomSong, subscribeSongOverrides, GENRES, ALL_KEYS } from '@/lib/songs'
import type { SongOverride } from '@/types'
import {
  fetchItunesResults,
  fetchYoutubeResults,
  type SpotifyTrackResult,
  type YoutubeVideoResult,
} from '@/lib/integrations'
import type { Song } from '@/types'

type Sort = 'popular' | 'recent' | 'title'
const PAGE_SIZE = 20

/** Artist popularity tiers — higher = more popular (used for default "Popular" sort).
 *  Based on CCLI Top 100 reporting and global worship chart presence. */
const ARTIST_POPULARITY: Record<string, number> = {
  'Hillsong Worship': 100, 'Hillsong UNITED': 95, 'Bethel Music': 98,
  'Elevation Worship': 97, 'Chris Tomlin': 96, 'Maverick City Music': 94,
  'Phil Wickham': 93, 'Matt Redman': 90, 'Kari Jobe': 89,
  'Lauren Daigle': 92, 'Casting Crowns': 88, 'MercyMe': 87,
  'Kirk Franklin': 91, 'CeCe Winans': 86, 'Tasha Cobbs Leonard': 85,
  'Brandon Lake': 84, 'Crowder': 83, 'Passion': 82,
  'Sinach': 81, 'Dunsin Oyekan': 80, 'Nathaniel Bassey': 79,
  'Israel Houghton': 78, 'We The Kingdom': 77, 'Jesus Culture': 76,
  'Housefires': 75, 'Zach Williams': 74, 'Cory Asbury': 73,
  'Gateway Worship': 72, 'Leeland': 71, 'Tauren Wells': 70,
  'Newsboys': 69, 'Jeremy Camp': 68, 'Michael W. Smith': 67,
  'Tope Alabi': 66, 'Frank Edwards': 65, 'Tim Godfrey': 64,
  'Travis Greene': 63, 'William McDowell': 62, 'Todd Dulaney': 61,
  'Darlene Zschech': 60, 'All Sons & Daughters': 59, 'Third Day': 58,
  'for KING & COUNTRY': 57, 'Vertical Worship': 56, 'UPPERROOM': 55,
  'Chandler Moore': 54, 'Sean Feucht': 53,
  'Traditional': 40,
}

/** Well-known song titles get a bonus (independently of artist).
 *  These are the most-reported worship songs globally. */
const TITLE_POPULARITY: Record<string, number> = {
  'Way Maker': 10, 'Goodness of God': 10, 'What a Beautiful Name': 10,
  'Oceans (Where Feet May Fail)': 10, 'How Great Is Our God': 10,
  '10,000 Reasons (Bless the Lord)': 10, 'Amazing Grace': 9,
  'Reckless Love': 9, 'The Blessing': 9, 'Build My Life': 9,
  'Great Are You Lord': 9, 'Holy Forever': 9, 'Battle Belongs': 8,
  'You Say': 8, 'Cornerstone': 8, 'King of Kings': 8,
  'Break Every Chain': 8, 'This Is Amazing Grace': 8,
  'Jireh': 8, 'Graves into Gardens': 8, 'O Come to the Altar': 8,
  'House of the Lord': 8, 'Blessed Assurance': 7, 'Holy Holy Holy': 7,
  'It Is Well with My Soul': 7, 'How Great Thou Art': 7,
  'Mighty to Save': 7, 'I Can Only Imagine': 7, 'Chain Breaker': 7,
  'Good Good Father': 7, 'Who You Say I Am': 7, 'So Will I (100 Billion X)': 7,
  'Living Hope': 7, 'Gratitude': 7, 'Same God': 7,
  'PRAISE': 7, 'Believe for It': 7, 'I Smile': 7,
  'Revelation Song': 7, 'I Surrender All': 6, 'Old Rugged Cross': 6,
  'Great Is Thy Faithfulness': 6, 'To God Be the Glory': 6,
}

function getPopularity(song: { title: string; artist?: string }): number {
  const artistScore = ARTIST_POPULARITY[song.artist ?? ''] ?? 30
  const titleBonus = TITLE_POPULARITY[song.title] ?? 0
  return artistScore + titleBonus
}

function fmtDuration(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

export function SongLibrary() {

  const { firebaseUser } = useAuth()
  const { choir, loading: choirLoading, isDirector } = useChoir()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [artist, setArtist] = useState('')
  const [keyFilter, setKeyFilter] = useState('')
  const [sort, setSort] = useState<Sort>('popular')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [showArchived, setShowArchived] = useState(false)
  const [overrides, setOverrides] = useState<Map<string, SongOverride>>(new Map())
  const [offlineOnly, setOfflineOnly] = useState(false)
  const offlineSongIds = useOfflineSongs()

  // External search results (iTunes — credential-free)
  const [itunesResults, setItunesResults] = useState<SpotifyTrackResult[]>([])
  const [itunesLoading, setItunesLoading] = useState(false)
  const [youtubeResults, setYoutubeResults] = useState<YoutubeVideoResult[]>([])
  const [youtubeLoading, setYoutubeLoading] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (choirLoading) return
    if (!choir) { setLoading(false); return }
    setLoading(true)
    const unsub = subscribeSongs(
      choir.id,
      s => { setSongs(s); setLoading(false) },
      err => { console.error('Load songs error:', err); setLoading(false) },
    )
    return unsub
  }, [choir, choirLoading])

  // Subscribe to song overrides (for archive filtering)
  useEffect(() => {
    if (choirLoading || !choir) return
    return subscribeSongOverrides(choir.id, setOverrides)
  }, [choir, choirLoading])

  // Debounced external search (iTunes + YouTube)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const term = search.trim()
    if (term.length < 3) {
      setItunesResults([])
      setYoutubeResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setItunesLoading(true)
      setYoutubeLoading(true)
      const [it, yt] = await Promise.all([
        fetchItunesResults(term),
        fetchYoutubeResults(term),
      ])
      setItunesResults(it)
      setItunesLoading(false)
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

  const choirHasAttestedCcli = Boolean(
    choir?.licensing?.attested && choir.licensing.ccliNumber?.trim(),
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = songs.filter(s => {
      const matchSearch = !term || s.title.toLowerCase().includes(term) || (s.artist ?? '').toLowerCase().includes(term)
      const matchGenre = !genre || s.genre === genre
      const matchArtist = !artist || s.artist === artist
      const matchKey = !keyFilter || s.defaultKey === keyFilter
      const overrideArchived = overrides.get(s.id)?.archived ?? false
      // Auto-archive CCLI-required songs when the choir has no attested licence (HARA-55)
      const licenseArchived = s.rights?.status === 'ccli_required' && !choirHasAttestedCcli
      const isArchived = overrideArchived || licenseArchived
      const matchArchive = showArchived || !isArchived
      const matchOffline = !offlineOnly || offlineSongIds.has(s.id)
      return matchSearch && matchGenre && matchArtist && matchKey && matchArchive && matchOffline
    })
    if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'popular') list.sort((a, b) => getPopularity(b) - getPopularity(a) || a.title.localeCompare(b.title))
    else list.sort((a, b) => +b.createdAt - +a.createdAt)
    return list
  }, [songs, search, genre, artist, keyFilter, sort, showArchived, overrides, choirHasAttestedCcli, offlineOnly, offlineSongIds])

  const archivedCount = useMemo(() => {
    let count = 0
    overrides.forEach(o => { if (o.archived) count++ })
    if (!choirHasAttestedCcli) {
      songs.forEach(s => {
        if (s.rights?.status === 'ccli_required' && !overrides.get(s.id)?.archived) count++
      })
    }
    return count
  }, [overrides, songs, choirHasAttestedCcli])

  const isSearching = search.trim().length >= 3
  const SEARCH_CAP = 5
  const page = isSearching ? filtered.slice(0, SEARCH_CAP) : filtered.slice(0, visible)

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
            placeholder="Search library, Apple Music, YouTube…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters — only shown when not in external-search mode */}
        {!isSearching && (
          <div className="space-y-2 mb-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                options={[{ value: 'popular', label: 'Most popular' }, { value: 'recent', label: 'Recently added' }, { value: 'title', label: 'Title A–Z' }]}
                placeholder="Sort" />
            </div>
            <div className="flex items-center gap-4">
              {offlineSongIds.size > 0 && (
                <button
                  onClick={() => setOfflineOnly(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium text-harmonic-muted hover:text-harmonic-text transition-colors"
                >
                  <WifiOff size={13} />
                  {offlineOnly ? 'Show all' : `Offline only (${offlineSongIds.size})`}
                </button>
              )}
              {isDirector && archivedCount > 0 && (
                <button
                  onClick={() => setShowArchived(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium text-harmonic-muted hover:text-harmonic-text transition-colors"
                >
                  <Archive size={13} />
                  {showArchived ? 'Hide archived' : `Show archived (${archivedCount})`}
                </button>
              )}
            </div>
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
                <p className="text-xs font-semibold font-cormorant text-harmonic-muted uppercase tracking-widest mb-3">
                  Your library
                </p>
              )}
              {page.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {page.map(song => (
                    <Link key={song.id} to={`/library/${song.id}`}>
                      <Card className="p-3 flex items-center gap-3 hover:bg-harmonic-surface/50 transition-colors">
                        <AlbumArt src={song.albumArtUrl} alt={`${song.title} artwork`} className="w-14 h-14 rounded-xl flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-harmonic-text truncate">{song.title}</p>
                          <p className="text-xs text-harmonic-muted truncate">{song.artist}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {song.defaultKey && <Badge tone="muted">{song.defaultKey}</Badge>}
                            {song.genre && <Badge tone="tertiary">{song.genre}</Badge>}
                            {song.isCustom && <Badge tone="primary">Custom</Badge>}
                            {offlineSongIds.has(song.id) && <Badge tone="success">Offline</Badge>}
                            {overrides.get(song.id)?.archived && <Badge tone="muted">Archived</Badge>}
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
                    description="Try a different filter — or search by name to discover songs on Apple Music and YouTube."
                  />
                </Card>
              )}

              {isSearching && filtered.length > SEARCH_CAP && (
                <div className="flex justify-center mt-3">
                  <Button variant="outlined" size="sm" onClick={() => setVisible(filtered.length)}>
                    Show all {filtered.length} library results
                  </Button>
                </div>
              )}
              {!isSearching && visible < filtered.length && (
                <div className="flex justify-center mt-4">
                  <Button variant="outlined" size="sm" onClick={() => setVisible(v => v + PAGE_SIZE)}>Load more</Button>
                </div>
              )}
            </section>

            {/* ── Apple Music / iTunes results ──────────────────── */}
            {isSearching && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Music2 size={14} className="text-[#FA243C]" />
                  <p className="text-xs font-semibold font-cormorant text-harmonic-muted uppercase tracking-widest">Apple Music</p>
                </div>

                {itunesLoading ? (
                  <Card className="p-4 flex items-center gap-3">
                    <Loader2 size={18} className="animate-spin text-harmonic-muted" />
                    <p className="text-sm text-harmonic-muted">Searching Apple Music…</p>
                  </Card>
                ) : itunesResults.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {itunesResults.slice(0, SEARCH_CAP).map(track => (
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
                          {track.externalUrl && (
                            <a
                              href={track.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Open in Apple Music"
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-harmonic-surface transition-colors text-harmonic-muted hover:text-[#FA243C]"
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}
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
                        </div>
                      </Card>
                    ))}
                    <a
                      href={`https://music.apple.com/search?term=${encodeURIComponent(search.trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-center pt-1"
                    >
                      <Button variant="outlined" size="sm">
                        <ExternalLink size={13} /> See all on Apple Music
                      </Button>
                    </a>
                  </div>
                ) : (
                  <Card className="p-4 text-center">
                    <p className="text-sm text-harmonic-muted">No Apple Music results for "{search.trim()}"</p>
                  </Card>
                )}
              </section>
            )}

            {/* ── YouTube results ───────────────────────────────── */}
            {isSearching && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Youtube size={14} className="text-[#FF0000]" />
                  <p className="text-xs font-semibold font-cormorant text-harmonic-muted uppercase tracking-widest">YouTube</p>
                </div>

                {youtubeLoading ? (
                  <Card className="p-4 flex items-center gap-3">
                    <Loader2 size={18} className="animate-spin text-harmonic-muted" />
                    <p className="text-sm text-harmonic-muted">Searching YouTube…</p>
                  </Card>
                ) : youtubeResults.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {youtubeResults.slice(0, SEARCH_CAP).map(video => (
                      <a
                        key={video.videoId}
                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Card className="p-3 flex items-center gap-3 hover:bg-harmonic-surface/50 transition-colors">
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
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(search.trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-center pt-1"
                    >
                      <Button variant="outlined" size="sm">
                        <ExternalLink size={13} /> See all on YouTube
                      </Button>
                    </a>
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
