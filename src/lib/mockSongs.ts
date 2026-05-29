import type { Song } from '@/types'

/* API_POINT: Spotify/Genius — these mock songs are replaced by the real
   Firestore-backed library + Spotify artwork/preview + Genius lyrics in Phase 4. */

export const MOCK_SONGS: Song[] = [
  { id: 's1',  title: 'Way Maker',              artist: 'Sinach',                   genre: 'Gospel',       defaultKey: 'E',  isCustom: false, addedBy: 'seed', createdAt: new Date(), updatedAt: new Date() },
  { id: 's2',  title: 'Goodness of God',        artist: 'Bethel Music',             genre: 'Contemporary', defaultKey: 'Ab', isCustom: false, addedBy: 'seed', createdAt: new Date(), updatedAt: new Date() },
  { id: 's3',  title: 'Promises',               artist: 'Maverick City Music',      genre: 'Contemporary', defaultKey: 'B',  isCustom: false, addedBy: 'seed', createdAt: new Date(), updatedAt: new Date() },
  { id: 's4',  title: 'Graves Into Gardens',    artist: 'Elevation Worship',        genre: 'Contemporary', defaultKey: 'C',  isCustom: false, addedBy: 'seed', createdAt: new Date(), updatedAt: new Date() },
  { id: 's5',  title: 'What A Beautiful Name',  artist: 'Hillsong Worship',         genre: 'Contemporary', defaultKey: 'D',  isCustom: false, addedBy: 'seed', createdAt: new Date(), updatedAt: new Date() },
  { id: 's6',  title: 'Na You Dey Reign',       artist: 'Dunsin Oyekan',            genre: 'Gospel',       defaultKey: 'G',  isCustom: false, addedBy: 'seed', createdAt: new Date(), updatedAt: new Date() },
  { id: 's7',  title: 'Intentional',            artist: 'Travis Greene',            genre: 'Gospel',       defaultKey: 'F',  isCustom: false, addedBy: 'seed', createdAt: new Date(), updatedAt: new Date() },
  { id: 's8',  title: 'Break Every Chain',      artist: 'Tasha Cobbs Leonard',      genre: 'Gospel',       defaultKey: 'C',  isCustom: false, addedBy: 'seed', createdAt: new Date(), updatedAt: new Date() },
  { id: 's9',  title: 'Imela',                  artist: 'Nathaniel Bassey',         genre: 'Gospel',       defaultKey: 'Bb', isCustom: false, addedBy: 'seed', createdAt: new Date(), updatedAt: new Date() },
  { id: 's10', title: 'You Are Mighty',         artist: 'Frank Edwards',            genre: 'Gospel',       defaultKey: 'A',  isCustom: false, addedBy: 'seed', createdAt: new Date(), updatedAt: new Date() },
  { id: 's11', title: 'Most Beautiful / So In Love', artist: 'Maverick City Music', genre: 'Contemporary', defaultKey: 'F',  isCustom: false, addedBy: 'seed', createdAt: new Date(), updatedAt: new Date() },
  { id: 's12', title: 'Raise A Hallelujah',     artist: 'Bethel Music',             genre: 'Contemporary', defaultKey: 'A',  isCustom: false, addedBy: 'seed', createdAt: new Date(), updatedAt: new Date() },
]

export function searchMockSongs(q: string): Song[] {
  const term = q.trim().toLowerCase()
  if (!term) return MOCK_SONGS
  return MOCK_SONGS.filter(
    s => s.title.toLowerCase().includes(term) || (s.artist ?? '').toLowerCase().includes(term)
  )
}

export function getMockSong(id: string): Song | undefined {
  return MOCK_SONGS.find(s => s.id === id)
}
