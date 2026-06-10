/**
 * Song Suggestion — Retrieval & Scoring
 *
 * Retrieves candidate songs from a choir's library and scores them
 * using a linear model over usage, liturgical, and popularity signals.
 */
import { getFirestore } from 'firebase-admin/firestore'
import type { SuggestionCandidate } from '../ai/prompts/song-suggestions/v1.js'

// ── Signal weights (hand-tuned, retrained weekly offline) ─────────────────

const W = {
  recency: 0.25,       // how recently the choir used this song
  frequency: 0.20,     // how often the choir uses this song
  seasonMatch: 0.20,   // liturgical/occasion alignment
  popularity: 0.15,    // cross-choir usage (cold start)
  directorTaste: 0.10, // accept/reject history
  themeMatch: 0.10,    // scripture/theme overlap
} as const

// ── Liturgical season helper ─────────────────────────────────────────────

type LiturgicalSeason = 'advent' | 'christmas' | 'lent' | 'easter' | 'pentecost' | 'ordinary'

function estimateSeason(date: Date): LiturgicalSeason {
  const m = date.getMonth() // 0-indexed
  const d = date.getDate()
  if (m === 11 && d >= 1) return 'advent'
  if (m === 11 && d >= 25 || m === 0 && d <= 6) return 'christmas'
  // Approximate Lent (Feb–Mar) and Easter (Mar–Apr)
  if (m === 1 && d >= 14 || m === 2) return 'lent'
  if (m === 3) return 'easter'
  if (m === 4 && d <= 20) return 'pentecost'
  return 'ordinary'
}

// ── Main retrieval function ─────────────────────────────────────────────

export interface RetrievalInput {
  choirId: string
  serviceDate: string
  serviceType?: string
  theme?: string
  scriptureRef?: string
  existingSongIds: string[]
}

export async function retrieveCandidates(
  input: RetrievalInput,
): Promise<SuggestionCandidate[]> {
  const db = getFirestore()
  const serviceDate = new Date(input.serviceDate)
  const season = estimateSeason(serviceDate)
  const nowMs = Date.now()

  // 1. Load choir's song library (global + custom)
  const [globalSnap, customSnap] = await Promise.all([
    db.collection('songs').get(),
    db.collection('choirs').doc(input.choirId).collection('songs').get(),
  ])

  interface SongDoc {
    id: string
    title: string
    artist?: string
    genre?: string
    defaultKey?: string
    themes?: string[]
    occasions?: string[]
    meta?: { liturgicalSeason?: string; themes?: string[]; occasions?: string[] }
  }

  const songs: SongDoc[] = [
    ...globalSnap.docs.map(d => ({ id: d.id, ...d.data() } as SongDoc)),
    ...customSnap.docs.map(d => ({ id: d.id, ...d.data() } as SongDoc)),
  ]

  // Exclude songs already in the set list
  const excludeSet = new Set(input.existingSongIds)
  const eligible = songs.filter(s => !excludeSet.has(s.id))

  // 2. Load usage history for this choir (last 6 months)
  const sixMonthsAgo = new Date(nowMs - 180 * 24 * 60 * 60 * 1000)
  const usageSnap = await db.collection('choirs').doc(input.choirId)
    .collection('services')
    .where('date', '>=', sixMonthsAgo)
    .get()

  // Build per-song usage stats
  const usageCount: Record<string, number> = {}
  const lastUsed: Record<string, number> = {}
  for (const svcDoc of usageSnap.docs) {
    const svcDate = svcDoc.data().date?.toDate?.()?.getTime?.() ?? 0
    const setlistSnap = await svcDoc.ref.collection('setlist').get()
    for (const item of setlistSnap.docs) {
      const songId = item.data().songId as string
      if (!songId) continue
      usageCount[songId] = (usageCount[songId] ?? 0) + 1
      lastUsed[songId] = Math.max(lastUsed[songId] ?? 0, svcDate)
    }
  }

  const maxUsage = Math.max(1, ...Object.values(usageCount))
  const maxRecency = nowMs

  // 3. Load accept/reject signals
  const feedbackSnap = await db.collection('choirs').doc(input.choirId)
    .collection('suggestionFeedback')
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get()
    .catch(() => null)

  const acceptCount: Record<string, number> = {}
  const rejectCount: Record<string, number> = {}
  if (feedbackSnap) {
    for (const doc of feedbackSnap.docs) {
      const d = doc.data()
      const sid = d.songId as string
      if (d.action === 'accept') acceptCount[sid] = (acceptCount[sid] ?? 0) + 1
      if (d.action === 'reject') rejectCount[sid] = (rejectCount[sid] ?? 0) + 1
    }
  }

  // 4. Score each song
  const themeTokens = new Set(
    [input.theme, input.scriptureRef]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .split(/\W+/)
      .filter(t => t.length > 2),
  )

  const scored: SuggestionCandidate[] = eligible.map(song => {
    const songThemes = [
      ...(song.themes ?? []),
      ...(song.meta?.themes ?? []),
      ...(song.meta?.occasions ?? []),
      ...(song.occasions ?? []),
    ]

    // Recency: higher = more recently used (0–1)
    const lu = lastUsed[song.id]
    const recencyScore = lu
      ? Math.max(0, 1 - (nowMs - lu) / (180 * 24 * 60 * 60 * 1000))
      : 0

    // Frequency: normalized usage count (0–1)
    const freqScore = (usageCount[song.id] ?? 0) / maxUsage

    // Season match
    const songSeason = song.meta?.liturgicalSeason
    const seasonScore = songSeason === season ? 1 : 0

    // Cross-choir popularity (cold start fallback)
    const popScore = usageCount[song.id] ? freqScore : 0.3

    // Director taste
    const accepts = acceptCount[song.id] ?? 0
    const rejects = rejectCount[song.id] ?? 0
    const tasteScore = (accepts + rejects) > 0
      ? accepts / (accepts + rejects)
      : 0.5

    // Theme match
    const songTokens = songThemes.map(t => t.toLowerCase())
    const overlap = songTokens.filter(t => themeTokens.has(t)).length
    const themeScore = themeTokens.size > 0 && songTokens.length > 0
      ? Math.min(1, overlap / Math.max(1, themeTokens.size))
      : 0

    const score =
      W.recency * recencyScore +
      W.frequency * freqScore +
      W.seasonMatch * seasonScore +
      W.popularity * popScore +
      W.directorTaste * tasteScore +
      W.themeMatch * themeScore

    return {
      songId: song.id,
      title: song.title,
      artist: song.artist,
      genre: song.genre,
      key: song.defaultKey,
      score,
      themes: songThemes.length ? songThemes : undefined,
      occasions: song.meta?.occasions,
    }
  })

  // 5. Sort and return top 30
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 30)
}
