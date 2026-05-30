import { httpsCallable } from 'firebase/functions'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { functions, db } from '@/lib/firebase'
import { spotifyKeyToNote } from '@/lib/utils'

/* All Spotify/Genius/Lyrics/AI access is server-side via Cloud Functions.
   The client only calls callables and caches lightweight results in Firestore. */

export interface SpotifyData {
  trackId: string | null
  albumArtUrl: string | null
  albumName: string | null
  releaseYear: number | null
  artistName: string | null
  durationSec: number | null
  previewUrl: string | null
  keyNote: string | null
  tempo: number | null
}

export interface GeniusData {
  url: string | null
}

export interface LyricsData {
  lyrics: string | null
}

export interface SongContextData {
  about: string | null
  themes: string[]
  resonance: string | null
}

export interface SpotifyTrackResult {
  trackId: string
  title: string
  artist: string
  albumArtUrl: string | null
  albumName: string | null
  releaseYear: number | null
  previewUrl: string | null
  durationSec: number | null
}

export interface YoutubeVideoResult {
  videoId: string
  title: string
  channelTitle: string
  thumbnailUrl: string | null
}

const cacheKeyFor = (title: string, artist?: string) =>
  `${title}__${artist ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '_')

/** Spotify single-track lookup with full metadata. */
export async function fetchSpotify(title: string, artist?: string): Promise<SpotifyData | null> {
  const key = cacheKeyFor(title, artist)
  try {
    const cacheRef = doc(db, 'spotifyCache', key)
    const cached = await getDoc(cacheRef)
    if (cached.exists()) {
      const d = cached.data()
      return {
        trackId: d.trackId ?? null,
        albumArtUrl: d.albumArtUrl ?? null,
        albumName: d.albumName ?? null,
        releaseYear: d.releaseYear ?? null,
        artistName: d.artistName ?? null,
        durationSec: d.durationSec ?? null,
        previewUrl: d.previewUrl ?? null,
        keyNote: d.key != null && d.mode != null ? spotifyKeyToNote(d.key, d.mode) : null,
        tempo: d.tempo ?? null,
      }
    }

    const call = httpsCallable<
      { title: string; artist?: string },
      { trackId: string | null; albumArtUrl: string | null; albumName: string | null; releaseYear: number | null; artistName: string | null; durationSec: number | null; previewUrl: string | null; key: number | null; mode: number | null; tempo: number | null }
    >(functions, 'spotifySearch')
    const { data } = await call({ title, artist })

    await setDoc(cacheRef, { ...data, cachedAt: serverTimestamp() }, { merge: true }).catch(() => {})

    return {
      trackId: data.trackId,
      albumArtUrl: data.albumArtUrl,
      albumName: data.albumName,
      releaseYear: data.releaseYear,
      artistName: data.artistName,
      durationSec: data.durationSec,
      previewUrl: data.previewUrl,
      keyNote: data.key != null && data.mode != null ? spotifyKeyToNote(data.key, data.mode) : null,
      tempo: data.tempo,
    }
  } catch (err) {
    console.warn('[spotify] lookup failed:', err)
    return null
  }
}

/** Genius lyrics-page URL lookup. */
export async function fetchGenius(title: string, artist?: string): Promise<GeniusData | null> {
  const key = cacheKeyFor(title, artist)
  try {
    const cacheRef = doc(db, 'geniusCache', key)
    const cached = await getDoc(cacheRef)
    if (cached.exists()) return { url: cached.data().url ?? null }

    const call = httpsCallable<{ title: string; artist?: string }, { url: string | null }>(functions, 'geniusSearch')
    const { data } = await call({ title, artist })
    await setDoc(cacheRef, { ...data, cachedAt: serverTimestamp() }, { merge: true }).catch(() => {})
    return data
  } catch (err) {
    console.warn('[genius] lookup failed:', err)
    return null
  }
}

/** Fetch actual lyrics text via lyrics.ovh (cached server-side). Returns null if not found. */
export async function fetchLyricsData(title: string, artist?: string): Promise<LyricsData> {
  const key = cacheKeyFor(title, artist)
  try {
    const cacheRef = doc(db, 'lyricsCache', key)
    const cached = await getDoc(cacheRef)
    if (cached.exists()) return { lyrics: cached.data().lyrics ?? null }

    const call = httpsCallable<{ title: string; artist?: string }, { lyrics: string | null }>(functions, 'fetchLyrics')
    const { data } = await call({ title, artist })
    await setDoc(cacheRef, { ...data, cachedAt: serverTimestamp() }, { merge: true }).catch(() => {})
    return data
  } catch (err) {
    console.warn('[lyrics] fetch failed:', err)
    return { lyrics: null }
  }
}

/** AI-generated knowledge card: what the song is about, themes, why it resonates. */
export async function fetchSongContext(title: string, artist?: string): Promise<SongContextData> {
  const key = cacheKeyFor(title, artist)
  try {
    const cacheRef = doc(db, 'songContextCache', key)
    const cached = await getDoc(cacheRef)
    if (cached.exists()) {
      const d = cached.data()
      return { about: d.about ?? null, themes: d.themes ?? [], resonance: d.resonance ?? null }
    }

    const call = httpsCallable<{ title: string; artist?: string }, SongContextData>(functions, 'getSongContext')
    const { data } = await call({ title, artist })
    await setDoc(cacheRef, { ...data, cachedAt: serverTimestamp() }, { merge: true }).catch(() => {})
    return data
  } catch (err) {
    console.warn('[context] fetch failed:', err)
    return { about: null, themes: [], resonance: null }
  }
}

/** Spotify embed URL — works without Premium. */
export const spotifyEmbedUrl = (trackId: string) =>
  `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`

/** Search Spotify for up to 5 tracks matching a free-text query. */
export async function fetchSpotifyResults(query: string): Promise<SpotifyTrackResult[]> {
  try {
    const call = httpsCallable<{ query: string }, { results: SpotifyTrackResult[] }>(functions, 'spotifyMultiSearch')
    const { data } = await call({ query })
    return data.results ?? []
  } catch (err) {
    console.warn('[spotifyMulti] search failed:', err)
    return []
  }
}

/** Search YouTube for up to 5 videos. Returns [] if YOUTUBE_API_KEY is not configured. */
export async function fetchYoutubeResults(query: string): Promise<YoutubeVideoResult[]> {
  try {
    const call = httpsCallable<{ query: string }, { results: YoutubeVideoResult[] }>(functions, 'youtubeSearch')
    const { data } = await call({ query })
    return data.results ?? []
  } catch (err) {
    console.warn('[youtube] search failed:', err)
    return []
  }
}

/** Create a Google Calendar event for a published service. */
export async function createCalendarEvent(params: {
  summary: string; description?: string; startISO: string; endISO: string
}): Promise<{ eventId: string; calendarLink: string } | null> {
  const accessToken = sessionStorage.getItem('harmonic_google_token')
  if (!accessToken) {
    console.warn('[calendar] no Google access token')
    return null
  }
  try {
    const call = httpsCallable<
      { accessToken: string; summary: string; description?: string; startISO: string; endISO: string },
      { eventId: string; calendarLink: string }
    >(functions, 'createCalendarEvent')
    const { data } = await call({ accessToken, ...params })
    return data
  } catch (err) {
    console.warn('[calendar] event creation failed:', err)
    return null
  }
}
