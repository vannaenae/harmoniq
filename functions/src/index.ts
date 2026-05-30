/**
 * Harmoniq Cloud Functions — all third-party API calls run here so that
 * SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / GENIUS_TOKEN / YOUTUBE_API_KEY
 * never reach the client.
 *
 * Configure secrets before deploy:
 *   firebase functions:secrets:set SPOTIFY_CLIENT_ID
 *   firebase functions:secrets:set SPOTIFY_CLIENT_SECRET
 *   firebase functions:secrets:set GENIUS_TOKEN
 *   firebase functions:secrets:set YOUTUBE_API_KEY   ← YouTube Data API v3 key
 *
 * Deploy:  npm --prefix functions run deploy
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp()
const db = getFirestore()

const SPOTIFY_CLIENT_ID = defineSecret('SPOTIFY_CLIENT_ID')
const SPOTIFY_CLIENT_SECRET = defineSecret('SPOTIFY_CLIENT_SECRET')
const GENIUS_TOKEN = defineSecret('GENIUS_TOKEN')
const YOUTUBE_API_KEY = defineSecret('YOUTUBE_API_KEY')

// ── Spotify: Client Credentials token (cached in memory per instance) ──────────
let cachedToken: { value: string; expiresAt: number } | null = null

async function getSpotifyToken(id: string, secret: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value
  }
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new HttpsError('internal', 'Spotify auth failed')
  const json = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 }
  return json.access_token
}

interface SpotifyResult {
  trackId: string | null
  albumArtUrl: string | null
  previewUrl: string | null
  key: number | null
  mode: number | null
  tempo: number | null
}

/**
 * spotifySearch — search a track by title + artist, return artwork, preview and
 * audio features. Results are cached in Firestore under /spotifyCache/{key}.
 */
export const spotifySearch = onCall(
  { secrets: [SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')
    const { title, artist } = request.data as { title: string; artist?: string }
    if (!title) throw new HttpsError('invalid-argument', 'title is required')

    const cacheKey = `${title}__${artist ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    const cacheRef = db.collection('spotifyCache').doc(cacheKey)
    const cached = await cacheRef.get()
    if (cached.exists) return cached.data() as SpotifyResult

    const token = await getSpotifyToken(SPOTIFY_CLIENT_ID.value(), SPOTIFY_CLIENT_SECRET.value())
    const q = encodeURIComponent(`track:${title}${artist ? ` artist:${artist}` : ''}`)
    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!searchRes.ok) throw new HttpsError('internal', 'Spotify search failed')
    const searchJson = (await searchRes.json()) as {
      tracks: { items: Array<{ id: string; album: { images: { url: string }[] }; preview_url: string | null }> }
    }
    const track = searchJson.tracks.items[0]

    let result: SpotifyResult = { trackId: null, albumArtUrl: null, previewUrl: null, key: null, mode: null, tempo: null }
    if (track) {
      // Audio features (key, tempo)
      let key: number | null = null, mode: number | null = null, tempo: number | null = null
      try {
        const featRes = await fetch(`https://api.spotify.com/v1/audio-features/${track.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (featRes.ok) {
          const feat = (await featRes.json()) as { key: number; mode: number; tempo: number }
          key = feat.key; mode = feat.mode; tempo = Math.round(feat.tempo)
        }
      } catch { /* audio-features optional */ }

      result = {
        trackId: track.id,
        albumArtUrl: track.album.images[0]?.url ?? null,
        previewUrl: track.preview_url,
        key, mode, tempo,
      }
    }

    await cacheRef.set(result)
    return result
  },
)

/**
 * geniusSearch — find the genius.com lyrics page URL (never the lyrics text).
 * Cached in Firestore under /geniusCache/{key}.
 */
export const geniusSearch = onCall({ secrets: [GENIUS_TOKEN] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')
  const { title, artist } = request.data as { title: string; artist?: string }
  if (!title) throw new HttpsError('invalid-argument', 'title is required')

  const cacheKey = `${title}__${artist ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const cacheRef = db.collection('geniusCache').doc(cacheKey)
  const cached = await cacheRef.get()
  if (cached.exists) return cached.data() as { url: string | null }

  const q = encodeURIComponent(`${title} ${artist ?? ''}`.trim())
  const res = await fetch(`https://api.genius.com/search?q=${q}`, {
    headers: { Authorization: `Bearer ${GENIUS_TOKEN.value()}` },
  })
  if (!res.ok) throw new HttpsError('internal', 'Genius search failed')
  const json = (await res.json()) as { response: { hits: Array<{ result: { url: string } }> } }
  const result = { url: json.response.hits[0]?.result.url ?? null }

  await cacheRef.set(result)
  return result
})

/**
 * spotifyMultiSearch — search by free-text query, return up to 5 tracks with
 * title, artist, album art and audio features. Cached in /spotifyMultiCache.
 */
export const spotifyMultiSearch = onCall(
  { secrets: [SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')
    const { query } = request.data as { query: string }
    if (!query?.trim()) throw new HttpsError('invalid-argument', 'query is required')

    const cacheKey = query.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
    const cacheRef = db.collection('spotifyMultiCache').doc(cacheKey)
    const cached = await cacheRef.get()
    if (cached.exists) return cached.data()

    const token = await getSpotifyToken(SPOTIFY_CLIENT_ID.value(), SPOTIFY_CLIENT_SECRET.value())
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query.trim())}&type=track&limit=5`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!searchRes.ok) throw new HttpsError('internal', 'Spotify search failed')

    const json = (await searchRes.json()) as {
      tracks: {
        items: Array<{
          id: string
          name: string
          artists: Array<{ name: string }>
          album: { name: string; images: Array<{ url: string }> }
          preview_url: string | null
          duration_ms: number
        }>
      }
    }

    const results = json.tracks.items.map(t => ({
      trackId: t.id,
      title: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      albumArtUrl: t.album.images[0]?.url ?? null,
      previewUrl: t.preview_url,
      durationSec: Math.round(t.duration_ms / 1000),
    }))

    const payload = { results }
    await cacheRef.set(payload)
    return payload
  },
)

/**
 * youtubeSearch — search YouTube Data API v3, return up to 5 videos.
 * Requires YOUTUBE_API_KEY secret (YouTube Data API v3 key from Google Cloud).
 * Cached in /youtubeCache.
 */
export const youtubeSearch = onCall({ secrets: [YOUTUBE_API_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')
  const { query } = request.data as { query: string }
  if (!query?.trim()) throw new HttpsError('invalid-argument', 'query is required')

  const cacheKey = query.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const cacheRef = db.collection('youtubeCache').doc(cacheKey)
  const cached = await cacheRef.get()
  if (cached.exists) return cached.data()

  const apiKey = YOUTUBE_API_KEY.value()
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query.trim())}&type=video&maxResults=5&key=${apiKey}`,
  )
  if (!res.ok) throw new HttpsError('internal', 'YouTube search failed')

  const json = (await res.json()) as {
    items: Array<{
      id: { videoId: string }
      snippet: {
        title: string
        channelTitle: string
        thumbnails: { medium?: { url: string } }
      }
    }>
  }

  const results = (json.items ?? []).map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnailUrl: item.snippet.thumbnails.medium?.url ?? null,
  }))

  const payload = { results }
  await cacheRef.set(payload)
  return payload
})

/**
 * createCalendarEvent — create a Google Calendar event for a published service.
 * The client passes a Google OAuth access token obtained at sign-in with the
 * calendar.events scope. Returns the shareable htmlLink members can add.
 */
export const createCalendarEvent = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')
  const { accessToken, summary, description, startISO, endISO } = request.data as {
    accessToken: string
    summary: string
    description?: string
    startISO: string
    endISO: string
  }
  if (!accessToken || !summary || !startISO) {
    throw new HttpsError('invalid-argument', 'accessToken, summary and startISO are required')
  }

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary,
      description: description ?? '',
      start: { dateTime: startISO },
      end: { dateTime: endISO ?? startISO },
    }),
  })
  if (!res.ok) throw new HttpsError('internal', 'Calendar event creation failed')
  const json = (await res.json()) as { id: string; htmlLink: string }
  return { eventId: json.id, calendarLink: json.htmlLink }
})
