import { httpsCallable } from 'firebase/functions'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { functions, db } from '@/lib/firebase'
import { spotifyKeyToNote } from '@/lib/utils'

/* All Spotify/Genius/Calendar access is server-side via Cloud Functions.
   The client only calls the callables below and caches the lightweight results
   in Firestore so we stay within rate limits. */

export interface SpotifyData {
  trackId: string | null
  albumArtUrl: string | null
  previewUrl: string | null
  keyNote: string | null   // letter notation derived from key+mode
  tempo: number | null
}

export interface GeniusData {
  url: string | null
}

const cacheKeyFor = (title: string, artist?: string) =>
  `${title}__${artist ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '_')

/** Spotify lookup with Firestore caching. Returns null on any failure so the UI
 *  can show "Song details couldn't load. You can still use the song." */
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
        previewUrl: d.previewUrl ?? null,
        keyNote: d.key != null && d.mode != null ? spotifyKeyToNote(d.key, d.mode) : null,
        tempo: d.tempo ?? null,
      }
    }

    const call = httpsCallable<{ title: string; artist?: string }, {
      trackId: string | null; albumArtUrl: string | null; previewUrl: string | null
      key: number | null; mode: number | null; tempo: number | null
    }>(functions, 'spotifySearch')
    const { data } = await call({ title, artist })

    // mirror into client-readable cache (function also writes its own copy)
    await setDoc(cacheRef, { ...data, cachedAt: serverTimestamp() }, { merge: true }).catch(() => {})

    return {
      trackId: data.trackId,
      albumArtUrl: data.albumArtUrl,
      previewUrl: data.previewUrl,
      keyNote: data.key != null && data.mode != null ? spotifyKeyToNote(data.key, data.mode) : null,
      tempo: data.tempo,
    }
  } catch (err) {
    console.warn('[spotify] lookup failed (function may not be deployed yet):', err)
    return null
  }
}

/** Genius lyrics-page URL lookup with Firestore caching. */
export async function fetchGenius(title: string, artist?: string): Promise<GeniusData | null> {
  const key = cacheKeyFor(title, artist)
  try {
    const cacheRef = doc(db, 'geniusCache', key)
    const cached = await getDoc(cacheRef)
    if (cached.exists()) return { url: cached.data().url ?? null }

    const call = httpsCallable<{ title: string; artist?: string }, { url: string | null }>(
      functions,
      'geniusSearch',
    )
    const { data } = await call({ title, artist })
    await setDoc(cacheRef, { ...data, cachedAt: serverTimestamp() }, { merge: true }).catch(() => {})
    return data
  } catch (err) {
    console.warn('[genius] lookup failed (function may not be deployed yet):', err)
    return null
  }
}

/** Spotify embed URL — works without Premium. */
export const spotifyEmbedUrl = (trackId: string) =>
  `https://open.spotify.com/embed/track/${trackId}`

export interface SpotifyTrackResult {
  trackId: string
  title: string
  artist: string
  albumArtUrl: string | null
  previewUrl: string | null
  durationSec: number | null
}

export interface YoutubeVideoResult {
  videoId: string
  title: string
  channelTitle: string
  thumbnailUrl: string | null
}

/** Search Spotify for up to 5 tracks matching a free-text query. */
export async function fetchSpotifyResults(query: string): Promise<SpotifyTrackResult[]> {
  try {
    const call = httpsCallable<{ query: string }, { results: SpotifyTrackResult[] }>(
      functions,
      'spotifyMultiSearch',
    )
    const { data } = await call({ query })
    return data.results ?? []
  } catch (err) {
    console.warn('[spotifyMulti] search failed:', err)
    return []
  }
}

/** Search YouTube for up to 5 videos matching a free-text query.
 *  Returns [] if YOUTUBE_API_KEY secret is not configured. */
export async function fetchYoutubeResults(query: string): Promise<YoutubeVideoResult[]> {
  try {
    const call = httpsCallable<{ query: string }, { results: YoutubeVideoResult[] }>(
      functions,
      'youtubeSearch',
    )
    const { data } = await call({ query })
    return data.results ?? []
  } catch (err) {
    console.warn('[youtube] search failed (set YOUTUBE_API_KEY secret to enable):', err)
    return []
  }
}

/** Create a Google Calendar event for a published service. */
export async function createCalendarEvent(params: {
  summary: string
  description?: string
  startISO: string
  endISO: string
}): Promise<{ eventId: string; calendarLink: string } | null> {
  const accessToken = sessionStorage.getItem('harmonic_google_token')
  if (!accessToken) {
    console.warn('[calendar] no Google access token in this session — re-sign-in to grant calendar scope')
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
