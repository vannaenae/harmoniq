import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Music2, ChevronRight } from 'lucide-react'
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
import { useChoir } from '@/contexts/ChoirContext'
import { listSongs, GENRES, ALL_KEYS } from '@/lib/songs'
import type { Song } from '@/types'

type Sort = 'recent' | 'title'
const PAGE_SIZE = 20

export function SongLibrary() {
  const { choir, isDirector } = useChoir()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [artist, setArtist] = useState('')
  const [keyFilter, setKeyFilter] = useState('')
  const [sort, setSort] = useState<Sort>('recent')
  const [visible, setVisible] = useState(PAGE_SIZE)

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
            placeholder="Search by title or artist"
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
        ) : page.length === 0 ? (
          <Card className="p-2">
            <EmptyState
              icon={Music2}
              title="No songs match"
              description="Try a different search or filter — or add a custom song to your library."
            />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {page.map(song => (
                <Link key={song.id} to={`/library/${song.id}`}>
                  <Card className="p-3 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
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
            {visible < filtered.length && (
              <div className="flex justify-center mt-5">
                <Button variant="outlined" size="sm" onClick={() => setVisible(v => v + PAGE_SIZE)}>Load more</Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
