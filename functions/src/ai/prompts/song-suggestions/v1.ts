/**
 * Song Suggestion Re-ranker prompt — v1
 *
 * Takes a shortlist of candidate songs (max 30) with features
 * and returns a ranked top-10 with one-line rationales.
 *
 * HARD CONSTRAINT: The LLM may only output song IDs from the
 * provided allow-list. Any hallucinated ID is rejected.
 */

export interface SuggestionCandidate {
  songId: string
  title: string
  artist?: string
  genre?: string
  key?: string
  score: number
  themes?: string[]
  occasions?: string[]
}

export interface ServiceContext {
  serviceDate: string
  serviceType?: string
  theme?: string
  scriptureRef?: string
  existingSongIds: string[]
  choirName?: string
}

export function buildSuggestionPrompt(
  candidates: SuggestionCandidate[],
  context: ServiceContext,
): string {
  const allowList = candidates.map(c => c.songId)
  const candidateBlock = candidates
    .map(c => {
      const parts = [`ID:${c.songId}`, `"${c.title}"`]
      if (c.artist) parts.push(`by ${c.artist}`)
      if (c.genre) parts.push(`[${c.genre}]`)
      if (c.key) parts.push(`key:${c.key}`)
      if (c.themes?.length) parts.push(`themes:${c.themes.join(',')}`)
      if (c.occasions?.length) parts.push(`occasions:${c.occasions.join(',')}`)
      parts.push(`retrieval_score:${c.score.toFixed(2)}`)
      return parts.join(' | ')
    })
    .join('\n')

  return `You are a worship service song curator for ${context.choirName ?? 'a church choir'}.

SERVICE CONTEXT:
- Date: ${context.serviceDate}
${context.serviceType ? `- Type: ${context.serviceType}` : ''}
${context.theme ? `- Theme: ${context.theme}` : ''}
${context.scriptureRef ? `- Scripture: ${context.scriptureRef}` : ''}
${context.existingSongIds.length ? `- Already in set list: ${context.existingSongIds.join(', ')}` : '- Empty set list'}

CANDIDATE SONGS (you may ONLY select from these):
${candidateBlock}

ALLOW-LIST (valid song IDs): ${JSON.stringify(allowList)}

TASK: Select the best 10 songs from the candidates for this service. Consider:
1. Thematic fit with the service theme/scripture
2. Musical flow and key progression
3. Avoid duplicating songs already in the set list
4. Mix of tempos and energy levels
5. Congregation familiarity (higher retrieval scores = more frequently used)

OUTPUT FORMAT (strict JSON, no markdown):
[{"songId":"<id>","rank":<1-10>,"rationale":"<one line>"}]

RULES:
- Output EXACTLY 10 items (or fewer if fewer than 10 candidates).
- Every songId MUST appear in the ALLOW-LIST above.
- Do NOT invent song titles or IDs.
- Respond with ONLY the JSON array, nothing else.`
}

/**
 * Parse and validate the LLM re-ranker output.
 * Rejects any song IDs not in the allow-list.
 */
export interface RankedSuggestion {
  songId: string
  rank: number
  rationale: string
}

export function parseRerankerOutput(
  raw: string,
  allowedIds: Set<string>,
): RankedSuggestion[] {
  // Strip markdown fences if present
  const cleaned = raw.replace(/```json?\s*/g, '').replace(/```/g, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) return []

  return (parsed as Array<Record<string, unknown>>)
    .filter(item =>
      typeof item.songId === 'string' &&
      allowedIds.has(item.songId) &&
      typeof item.rank === 'number' &&
      typeof item.rationale === 'string',
    )
    .map(item => ({
      songId: item.songId as string,
      rank: item.rank as number,
      rationale: item.rationale as string,
    }))
    .sort((a, b) => a.rank - b.rank)
}
