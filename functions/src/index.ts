/**
 * Harmoniq Cloud Functions — all third-party API calls run here so that
 * secrets never reach the client.
 *
 * Configure secrets before deploy:
 *   firebase functions:secrets:set SPOTIFY_CLIENT_ID
 *   firebase functions:secrets:set SPOTIFY_CLIENT_SECRET
 *   firebase functions:secrets:set GENIUS_TOKEN
 *   firebase functions:secrets:set YOUTUBE_API_KEY     ← YouTube Data API v3 key
 *   firebase functions:secrets:set OPENAI_API_KEY       ← OpenAI API key (song context)
 *
 * Deploy:  npm --prefix functions run deploy
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp()
const db = getFirestore()

const SPOTIFY_CLIENT_ID     = defineSecret('SPOTIFY_CLIENT_ID')
const SPOTIFY_CLIENT_SECRET = defineSecret('SPOTIFY_CLIENT_SECRET')
const GENIUS_TOKEN          = defineSecret('GENIUS_TOKEN')
const YOUTUBE_API_KEY       = defineSecret('YOUTUBE_API_KEY')
const OPENAI_API_KEY        = defineSecret('OPENAI_API_KEY')
const ANTHROPIC_API_KEY     = defineSecret('ANTHROPIC_API_KEY')

// ── Spotify: Client Credentials token (cached in memory per instance) ──────
let cachedToken: { value: string; expiresAt: number } | null = null

async function getSpotifyToken(id: string, secret: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value
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
  return cachedToken.value
}

// ── spotifySearch ────────────────────────────────────────────────────────────
// Single-track lookup by title + artist. Returns enriched metadata including
// album name and release year. Cached in /spotifyCache.
export const spotifySearch = onCall(
  { secrets: [SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')
    const { title, artist } = request.data as { title: string; artist?: string }
    if (!title) throw new HttpsError('invalid-argument', 'title is required')

    const cacheKey = `${title}__${artist ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    const cacheRef = db.collection('spotifyCache').doc(cacheKey)
    const cached = await cacheRef.get()
    if (cached.exists) return cached.data()

    const token = await getSpotifyToken(SPOTIFY_CLIENT_ID.value(), SPOTIFY_CLIENT_SECRET.value())
    const q = encodeURIComponent(`track:${title}${artist ? ` artist:${artist}` : ''}`)
    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!searchRes.ok) throw new HttpsError('internal', 'Spotify search failed')

    const searchJson = (await searchRes.json()) as {
      tracks: {
        items: Array<{
          id: string
          name: string
          artists: Array<{ name: string }>
          album: { name: string; images: Array<{ url: string }>; release_date: string }
          preview_url: string | null
          duration_ms: number
        }>
      }
    }
    const track = searchJson.tracks.items[0]

    let result = {
      trackId: null as string | null,
      albumArtUrl: null as string | null,
      albumName: null as string | null,
      releaseYear: null as number | null,
      artistName: null as string | null,
      durationSec: null as number | null,
      previewUrl: null as string | null,
      key: null as number | null,
      mode: null as number | null,
      tempo: null as number | null,
    }

    if (track) {
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
        albumName: track.album.name ?? null,
        releaseYear: track.album.release_date ? parseInt(track.album.release_date.slice(0, 4)) : null,
        artistName: track.artists.map(a => a.name).join(', '),
        durationSec: Math.round(track.duration_ms / 1000),
        previewUrl: track.preview_url,
        key, mode, tempo,
      }
    }

    await cacheRef.set(result)
    return result
  },
)

// ── geniusSearch ─────────────────────────────────────────────────────────────
// Find the genius.com lyrics page URL. Cached in /geniusCache.
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

// ── fetchLyrics ──────────────────────────────────────────────────────────────
// Fetch actual lyrics text via the free lyrics.ovh API (no auth required).
// Cached in /lyricsCache. Falls back gracefully to null.
export const fetchLyrics = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')
  const { title, artist } = request.data as { title: string; artist?: string }
  if (!title) throw new HttpsError('invalid-argument', 'title is required')

  const cacheKey = `${title}__${artist ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const cacheRef = db.collection('lyricsCache').doc(cacheKey)
  const cached = await cacheRef.get()
  if (cached.exists) return cached.data() as { lyrics: string | null }

  let lyrics: string | null = null
  try {
    const artistPath = encodeURIComponent((artist ?? '').trim() || '_')
    const titlePath  = encodeURIComponent(title.trim())
    const res = await fetch(`https://api.lyrics.ovh/v1/${artistPath}/${titlePath}`)
    if (res.ok) {
      const json = (await res.json()) as { lyrics?: string; error?: string }
      if (json.lyrics && !json.error) {
        lyrics = json.lyrics.trim()
      }
    }
  } catch { /* no lyrics available */ }

  const result = { lyrics }
  await cacheRef.set(result)
  return result
})

// ── getSongContext ────────────────────────────────────────────────────────────
// Use Claude (Haiku) to generate a structured knowledge card about the song:
// what it's about, key themes, and why it resonates. Cached in /songContextCache.
// Requires ANTHROPIC_API_KEY secret.
export const getSongContext = onCall({ secrets: [OPENAI_API_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')
  const { title, artist } = request.data as { title: string; artist?: string }
  if (!title) throw new HttpsError('invalid-argument', 'title is required')

  const cacheKey = `${title}__${artist ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const cacheRef = db.collection('songContextCache').doc(cacheKey)
  const cached = await cacheRef.get()
  if (cached.exists) return cached.data()

  const songLabel = artist ? `"${title}" by ${artist}` : `"${title}"`
  const prompt = `You are a music expert. Provide a concise knowledge card for the song ${songLabel}.

Return ONLY a JSON object with exactly these fields:
{
  "about": "2-3 sentences describing what this song is about — its story, meaning, and emotional core",
  "themes": ["Theme1", "Theme2", "Theme3"],
  "resonance": "One sentence on why this song deeply connects with listeners or congregations"
}

If you don't know the song, make a reasonable inference from the title and artist. Return ONLY valid JSON.`

  const empty = { about: null as string | null, themes: [] as string[], resonance: null as string | null }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY.value()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (res.ok) {
      const json = (await res.json()) as { choices: Array<{ message: { content: string } }> }
      const text = json.choices[0]?.message?.content?.trim() ?? ''
      const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
      try {
        const parsed = JSON.parse(cleaned) as typeof empty
        const result = {
          about: typeof parsed.about === 'string' ? parsed.about : null,
          themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 4).map(String) : [],
          resonance: typeof parsed.resonance === 'string' ? parsed.resonance : null,
        }
        await cacheRef.set(result)
        return result
      } catch { /* JSON parse failed — fall through */ }
    }
  } catch { /* API call failed */ }

  await cacheRef.set(empty)
  return empty
})

// ── spotifyMultiSearch ────────────────────────────────────────────────────────
// Free-text search returning up to 5 tracks. Cached in /spotifyMultiCache.
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
          album: { name: string; images: Array<{ url: string }>; release_date: string }
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
      albumName: t.album.name ?? null,
      releaseYear: t.album.release_date ? parseInt(t.album.release_date.slice(0, 4)) : null,
      previewUrl: t.preview_url,
      durationSec: Math.round(t.duration_ms / 1000),
    }))

    const payload = { results }
    await cacheRef.set(payload)
    return payload
  },
)

// ── youtubeSearch ─────────────────────────────────────────────────────────────
// YouTube Data API v3 search. Requires YOUTUBE_API_KEY. Cached in /youtubeCache.
export const youtubeSearch = onCall({ secrets: [YOUTUBE_API_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')
  const { query } = request.data as { query: string }
  if (!query?.trim()) throw new HttpsError('invalid-argument', 'query is required')

  const cacheKey = query.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const cacheRef = db.collection('youtubeCache').doc(cacheKey)
  const cached = await cacheRef.get()
  if (cached.exists) return cached.data()

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query.trim())}&type=video&maxResults=5&key=${YOUTUBE_API_KEY.value()}`,
  )
  if (!res.ok) throw new HttpsError('internal', 'YouTube search failed')

  const json = (await res.json()) as {
    items: Array<{
      id: { videoId: string }
      snippet: { title: string; channelTitle: string; thumbnails: { medium?: { url: string } } }
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

// ── createCalendarEvent ───────────────────────────────────────────────────────
export const createCalendarEvent = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')
  const { accessToken, summary, description, startISO, endISO } = request.data as {
    accessToken: string; summary: string; description?: string; startISO: string; endISO: string
  }
  if (!accessToken || !summary || !startISO) {
    throw new HttpsError('invalid-argument', 'accessToken, summary and startISO are required')
  }
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary, description: description ?? '', start: { dateTime: startISO }, end: { dateTime: endISO ?? startISO } }),
  })
  if (!res.ok) throw new HttpsError('internal', 'Calendar event creation failed')
  const json = (await res.json()) as { id: string; htmlLink: string }
  return { eventId: json.id, calendarLink: json.htmlLink }
})

// ── Song Suggestions ─────────────────────────────────────────────────────────
// POST /suggestions/songs — returns ranked song suggestions for a service.
// Uses retrieval scoring + Claude Haiku re-ranker via AI gateway.

import { suggestSongs, recordSuggestionFeedback } from './suggestions/suggest.js'
import { aiGateway } from './ai/gateway.js'
import {
  buildTranslationPrompt,
  parseTranslationOutput,
  SUPPORTED_TRANSLATION_LANGUAGES,
  type Language,
  type LyricSectionInput,
} from './ai/prompts/song-translations/v1.js'

// ── Song Media (Storage trigger) ────────────────────────────────────────────
// NOTE: Temporarily disabled — requires Firebase Storage bucket (choir-flow-26.firebasestorage.app)
// to be provisioned via Firebase Console before this trigger can be deployed.
// export { onSongMediaUploaded } from './songMedia.js'

export const getSongSuggestions = onCall(
  { secrets: [ANTHROPIC_API_KEY] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')

    const { choirId, serviceDate, serviceType, theme, scriptureRef, existingSongIds, choirName } =
      request.data as {
        choirId: string
        serviceDate: string
        serviceType?: string
        theme?: string
        scriptureRef?: string
        existingSongIds?: string[]
        choirName?: string
      }

    if (!choirId || !serviceDate) {
      throw new HttpsError('invalid-argument', 'choirId and serviceDate are required')
    }

    // Verify caller is a member of the choir
    const memberSnap = await db.collection('choirs').doc(choirId)
      .collection('members').doc(request.auth.uid).get()
    if (!memberSnap.exists) {
      throw new HttpsError('permission-denied', 'You are not a member of this choir')
    }

    const result = await suggestSongs({
      choirId,
      serviceDate,
      serviceType,
      theme,
      scriptureRef,
      existingSongIds,
      choirName,
    })

    return result
  },
)

export const submitSuggestionFeedback = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')

  const { choirId, songId, action, serviceId } = request.data as {
    choirId: string
    songId: string
    action: 'accept' | 'reject' | 'replace'
    serviceId?: string
  }

  if (!choirId || !songId || !action) {
    throw new HttpsError('invalid-argument', 'choirId, songId, and action are required')
  }

  await recordSuggestionFeedback(choirId, songId, action, request.auth.uid, serviceId)
  return { ok: true }
})

// ── Song Translation ────────────────────────────────────────────────────────
// AI-powered translation of worship songs. Gated to public-domain +
// director-uploaded songs. Rate-limited to 50 translations/choir/month.

const TRANSLATION_MODEL = 'claude-sonnet-4-6-20250514'
const MONTHLY_TRANSLATION_LIMIT = 50

export const translateSong = onCall(
  { secrets: [ANTHROPIC_API_KEY] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')

    const { songId, targetLanguage, choirId } = request.data as {
      songId: string
      targetLanguage: Language
      choirId: string
    }

    if (!songId || !targetLanguage || !choirId) {
      throw new HttpsError('invalid-argument', 'songId, targetLanguage, and choirId are required')
    }

    // Validate target language
    if (!SUPPORTED_TRANSLATION_LANGUAGES.includes(targetLanguage)) {
      throw new HttpsError(
        'invalid-argument',
        `Unsupported language: ${targetLanguage}. Supported: ${SUPPORTED_TRANSLATION_LANGUAGES.join(', ')}`,
      )
    }

    // Director-only: verify caller is a director of this choir
    const memberSnap = await db.collection('choirs').doc(choirId)
      .collection('members').doc(request.auth.uid).get()
    if (!memberSnap.exists) {
      throw new HttpsError('permission-denied', 'You are not a member of this choir')
    }
    const memberData = memberSnap.data() as { role?: string }
    if (memberData.role !== 'director') {
      throw new HttpsError('permission-denied', 'Only directors can request translations')
    }

    // Load the song
    const songRef = db.collection('songs').doc(songId)
    const songSnap = await songRef.get()
    if (!songSnap.exists) {
      throw new HttpsError('not-found', 'Song not found')
    }
    const song = songSnap.data() as {
      title: string
      artist?: string
      origin?: string
      lyrics?: LyricSectionInput[]
      rights?: { status?: string }
      addedBy?: string
      choirId?: string
    }

    // Legal gate: only public-domain or director-uploaded custom songs
    const isPublicDomain = song.rights?.status === 'public_domain'
    const isDirectorUploaded = song.origin === 'custom'
    if (!isPublicDomain && !isDirectorUploaded) {
      throw new HttpsError(
        'permission-denied',
        'Translation requires hosted lyrics. Only public-domain and director-uploaded songs can be translated.',
      )
    }

    if (!song.lyrics || song.lyrics.length === 0) {
      throw new HttpsError('failed-precondition', 'Song has no lyrics to translate')
    }

    // Check cache first
    const cacheKey = `${songId}_${targetLanguage}`
    const cacheRef = db.collection('songTranslationCache').doc(cacheKey)
    const cached = await cacheRef.get()
    if (cached.exists) {
      return cached.data()
    }

    // Monthly rate limit: 50 translations per choir per month
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const usageRef = db.collection('translationUsage').doc(`${choirId}_${monthKey}`)
    const usageSnap = await usageRef.get()
    const currentCount = usageSnap.exists
      ? ((usageSnap.data() as { count?: number }).count ?? 0)
      : 0

    if (currentCount >= MONTHLY_TRANSLATION_LIMIT) {
      throw new HttpsError(
        'resource-exhausted',
        `Monthly translation limit reached (${MONTHLY_TRANSLATION_LIMIT}/month). Upgrade your plan for more translations.`,
      )
    }

    // Set API key on gateway
    aiGateway.setApiKey('ANTHROPIC_API_KEY', ANTHROPIC_API_KEY.value())

    // Build prompt and call AI gateway
    const prompt = buildTranslationPrompt(
      song.title,
      song.artist,
      song.lyrics,
      targetLanguage,
    )

    const result = await aiGateway.callModel({
      feature: 'song-translation',
      promptVersion: 'v1',
      model: TRANSLATION_MODEL,
      prompt,
      params: { maxTokens: 4000, temperature: 0.3 },
      choirId,
    })

    // Parse and validate
    const translatedSections = parseTranslationOutput(result.text, song.lyrics.length)
    if (!translatedSections) {
      throw new HttpsError('internal', 'Translation failed: could not parse AI response')
    }

    // Build translation record
    const translation = {
      songId,
      language: targetLanguage,
      sections: translatedSections.map(s => ({
        kind: s.kind,
        number: s.number ?? undefined,
        lines: s.lines,
        language: s.language,
      })),
      translator: 'ai' as const,
      aiModel: result.model,
      reviewedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Write to cache and increment usage counter in parallel
    await Promise.all([
      cacheRef.set(translation),
      usageRef.set(
        { count: (currentCount + 1), choirId, month: monthKey, updatedAt: new Date().toISOString() },
        { merge: true },
      ),
    ])

    return translation
  },
)

// ── Approve Translation ─────────────────────────────────────────────────────
// Director marks an AI translation as reviewed. Updates the cache record
// with reviewedBy + updatedAt.

export const approveTranslation = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')

  const { songId, targetLanguage, choirId } = request.data as {
    songId: string
    targetLanguage: Language
    choirId: string
  }

  if (!songId || !targetLanguage || !choirId) {
    throw new HttpsError('invalid-argument', 'songId, targetLanguage, and choirId are required')
  }

  // Director-only
  const memberSnap = await db.collection('choirs').doc(choirId)
    .collection('members').doc(request.auth.uid).get()
  if (!memberSnap.exists) {
    throw new HttpsError('permission-denied', 'You are not a member of this choir')
  }
  const memberData = memberSnap.data() as { role?: string }
  if (memberData.role !== 'director') {
    throw new HttpsError('permission-denied', 'Only directors can approve translations')
  }

  // Update cache record
  const cacheKey = `${songId}_${targetLanguage}`
  const cacheRef = db.collection('songTranslationCache').doc(cacheKey)
  const cacheSnap = await cacheRef.get()
  if (!cacheSnap.exists) {
    throw new HttpsError('not-found', 'Translation not found')
  }

  await cacheRef.update({
    reviewedBy: request.auth.uid,
    updatedAt: new Date().toISOString(),
  })

  return { ok: true, reviewedBy: request.auth.uid }
})

// ── Catalog Expansion Pipeline (HARA-82) ────────────────────────────────────
// Daily scheduled function + manual HTTP callable to add ~1,000 songs/day.
// Schedule: 03:00 UTC every day (Cloud Scheduler).
// Manual trigger: catalogExpansionRun (callable, any signed-in user).

export { catalogExpansionScheduled, catalogExpansionRun } from './catalog-pipeline.js'
