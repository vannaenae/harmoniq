/**
 * Song Suggestion Service
 *
 * Combines retrieval scoring with LLM re-ranking to produce
 * per-choir, per-service song suggestions.
 */
import { aiGateway } from '../ai/gateway.js'
import { retrieveCandidates, type RetrievalInput } from './retrieval.js'
import {
  buildSuggestionPrompt,
  parseRerankerOutput,
  type ServiceContext,
  type RankedSuggestion,
  type SuggestionCandidate,
} from '../ai/prompts/song-suggestions/v1.js'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const db = getFirestore()

const RERANKER_MODEL = 'claude-haiku-4-5-20251001'
const COLD_START_WEEKS = 4

export interface SuggestionRequest {
  choirId: string
  serviceDate: string
  serviceType?: string
  theme?: string
  scriptureRef?: string
  existingSongIds?: string[]
  choirName?: string
}

export interface SuggestionResult {
  candidates: Array<{
    songId: string
    score: number
    rationale: string
  }>
  model: string
  usedReranker: boolean
}

/**
 * Generate song suggestions for a service.
 */
export async function suggestSongs(req: SuggestionRequest): Promise<SuggestionResult> {
  const existingSongIds = req.existingSongIds ?? []

  // 1. Retrieval: score and shortlist ~30 candidates
  const retrievalInput: RetrievalInput = {
    choirId: req.choirId,
    serviceDate: req.serviceDate,
    serviceType: req.serviceType,
    theme: req.theme,
    scriptureRef: req.scriptureRef,
    existingSongIds,
  }

  const candidates = await retrieveCandidates(retrievalInput)

  if (candidates.length === 0) {
    return { candidates: [], model: 'none', usedReranker: false }
  }

  // 2. Check if choir has enough history for personalization
  const isColdStart = await checkColdStart(req.choirId)

  // 3. For cold start or very small candidate sets, skip re-ranker
  if (isColdStart || candidates.length <= 5) {
    return {
      candidates: candidates.slice(0, 10).map((c, i) => ({
        songId: c.songId,
        score: c.score,
        rationale: isColdStart
          ? 'Popular choice based on similar choirs'
          : `Ranked #${i + 1} by usage and fit`,
      })),
      model: 'retrieval-only',
      usedReranker: false,
    }
  }

  // 4. LLM re-ranking
  const serviceContext: ServiceContext = {
    serviceDate: req.serviceDate,
    serviceType: req.serviceType,
    theme: req.theme,
    scriptureRef: req.scriptureRef,
    existingSongIds,
    choirName: req.choirName,
  }

  const prompt = buildSuggestionPrompt(candidates, serviceContext)
  const allowedIds = new Set(candidates.map(c => c.songId))

  try {
    const result = await aiGateway.callModel({
      feature: 'song-suggestions',
      promptVersion: 'v1',
      model: RERANKER_MODEL,
      prompt,
      params: { maxTokens: 600, temperature: 0.3 },
      choirId: req.choirId,
    })

    const ranked = parseRerankerOutput(result.text, allowedIds)

    // Hallucination guard: if parse returned nothing, fall back to retrieval order
    if (ranked.length === 0) {
      return fallbackToRetrieval(candidates)
    }

    // Merge scores: combine retrieval score with rank position
    const candidateMap = new Map(candidates.map(c => [c.songId, c]))
    const merged = ranked.map(r => {
      const c = candidateMap.get(r.songId)
      return {
        songId: r.songId,
        score: c ? c.score : 0,
        rationale: r.rationale,
      }
    })

    return {
      candidates: merged,
      model: result.model,
      usedReranker: true,
    }
  } catch {
    // On any LLM error, gracefully fall back to retrieval order
    return fallbackToRetrieval(candidates)
  }
}

function fallbackToRetrieval(
  candidates: SuggestionCandidate[],
): SuggestionResult {
  return {
    candidates: candidates.slice(0, 10).map((c, i) => ({
      songId: c.songId,
      score: c.score,
      rationale: `Ranked #${i + 1} by usage and thematic fit`,
    })),
    model: 'retrieval-only',
    usedReranker: false,
  }
}

async function checkColdStart(choirId: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - COLD_START_WEEKS * 7 * 24 * 60 * 60 * 1000)
  const snap = await db.collection('choirs').doc(choirId)
    .collection('services')
    .where('date', '>=', cutoff)
    .limit(1)
    .get()
  return snap.empty
}

/**
 * Record accept/reject feedback for online learning.
 */
export async function recordSuggestionFeedback(
  choirId: string,
  songId: string,
  action: 'accept' | 'reject' | 'replace',
  userId: string,
  serviceId?: string,
): Promise<void> {
  await db.collection('choirs').doc(choirId)
    .collection('suggestionFeedback')
    .add({
      songId,
      action,
      userId,
      serviceId: serviceId ?? null,
      createdAt: FieldValue.serverTimestamp(),
    })
}
