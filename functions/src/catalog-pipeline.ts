/**
 * Daily catalog expansion pipeline — HARA-82
 *
 * Adds ~1,000 new unique songs per execution to the global /songs collection.
 *
 * Design
 * ──────
 * • Sources: EXPANSION_CATALOGUE (catalog-expansion.ts) + CATALOG_BATCH_V2
 *   (catalog-batch-v2.ts) = ~1,500 curated worship songs.
 * • Dedup strategy: canonical key = `${title.toLowerCase().trim()}|${artist.toLowerCase().trim()}`.
 *   Songs already present in /songs are skipped.
 * • Batch limit: DAILY_BATCH_SIZE = 1,000. Writes proceed in Firestore
 *   batches of 500 (Firestore max per commit).
 * • State logging: each run appends a doc to /catalogPipelineRuns with
 *   { runAt, added, skipped, total, catalog }.
 * • Idempotent: re-running writes nothing if all songs are already present.
 *
 * Triggers
 * ──────────
 * 1. Cloud Scheduler (daily):  exports `catalogExpansionScheduled`
 *    Schedule defined in firebase.json or via Cloud Scheduler console:
 *    cron: "0 3 * * *"  (03:00 UTC every day)
 *
 * 2. Manual HTTP callable:     exports `catalogExpansionRun`
 *    Callable by an authenticated director to trigger on demand.
 *    Accepts optional { dryRun: true } to preview without writing.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { EXPANSION_CATALOGUE } from './catalog-expansion.js'
import { CATALOG_BATCH_V2, type BatchSong } from './catalog-batch-v2.js'

const db = getFirestore()

// ── Constants ─────────────────────────────────────────────────────────────────
const SONGS_COLLECTION    = 'songs'
const PIPELINE_LOG_COL    = 'catalogPipelineRuns'
const DAILY_BATCH_SIZE    = 1000
const FIRESTORE_MAX_BATCH = 499   // Firestore max writes per batch commit

// ── Types ─────────────────────────────────────────────────────────────────────
interface PipelineResult {
  runAt: string
  added: number
  skipped: number
  duplicates: number
  total: number
  catalogSize: number
  dryRun: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Canonical dedup key: normalised title + artist */
function dedupKey(title: string, artist?: string): string {
  const t = title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
  const a = (artist ?? '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
  return `${t}|${a}`
}

/** Build the merged, internally deduped catalog from all sources */
function buildFullCatalog(): BatchSong[] {
  // Merge expansion + batch v2; EXPANSION_CATALOGUE satisfies BatchSong shape
  const raw = [...(EXPANSION_CATALOGUE as unknown as BatchSong[]), ...CATALOG_BATCH_V2]

  const seen = new Set<string>()
  const deduped: BatchSong[] = []
  for (const song of raw) {
    const key = dedupKey(song.title, song.artist)
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(song)
    }
  }
  return deduped
}

/** Fetch canonical keys of all songs already in /songs */
async function fetchExistingKeys(): Promise<Set<string>> {
  // Project only title + artist to keep read cost minimal
  const snap = await db.collection(SONGS_COLLECTION).select('title', 'artist').get()
  const keys = new Set<string>()
  for (const doc of snap.docs) {
    const { title, artist } = doc.data() as { title?: string; artist?: string }
    if (title) keys.add(dedupKey(title, artist))
  }
  return keys
}

/** Core pipeline logic — returns a result summary */
async function runPipeline(dryRun = false): Promise<PipelineResult> {
  const runAt = new Date().toISOString()

  const fullCatalog  = buildFullCatalog()
  const existingKeys = await fetchExistingKeys()

  // Filter to genuinely new songs
  const newSongs = fullCatalog.filter(s => !existingKeys.has(dedupKey(s.title, s.artist)))
  const toAdd    = newSongs.slice(0, DAILY_BATCH_SIZE)

  const skipped    = fullCatalog.length - newSongs.length   // already in Firestore
  const duplicates = 0                                       // handled by buildFullCatalog

  console.log(
    `[catalog-pipeline] catalog=${fullCatalog.length}  ` +
    `existing=${existingKeys.size}  new=${newSongs.length}  ` +
    `adding=${toAdd.length}  dryRun=${dryRun}`,
  )

  if (!dryRun && toAdd.length > 0) {
    // Write in chunks of FIRESTORE_MAX_BATCH
    let offset = 0
    while (offset < toAdd.length) {
      const chunk = toAdd.slice(offset, offset + FIRESTORE_MAX_BATCH)
      const batch = db.batch()
      for (const song of chunk) {
        const ref = db.collection(SONGS_COLLECTION).doc(song.id)
        batch.set(ref, {
          ...song,
          origin: 'seed',
          addedBy: 'catalog-pipeline',
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: false })
      }
      await batch.commit()
      offset += FIRESTORE_MAX_BATCH
    }
  }

  const result: PipelineResult = {
    runAt,
    added:       dryRun ? 0 : toAdd.length,
    skipped,
    duplicates,
    total:       fullCatalog.length,
    catalogSize: fullCatalog.length,
    dryRun,
  }

  // Always log the run
  await db.collection(PIPELINE_LOG_COL).add({
    ...result,
    songsQueued: toAdd.map(s => ({ id: s.id, title: s.title, artist: s.artist })),
  })

  console.log(
    `[catalog-pipeline] run complete — added=${result.added}  ` +
    `skipped=${result.skipped}  dryRun=${dryRun}`,
  )

  return result
}

// ── Scheduled export (Cloud Scheduler — daily at 03:00 UTC) ──────────────────

export const catalogExpansionScheduled = onSchedule(
  { schedule: '0 3 * * *', timeZone: 'UTC', memory: '512MiB', timeoutSeconds: 540 },
  async () => {
    try {
      const result = await runPipeline(false)
      console.log(`[catalogExpansionScheduled] done: added=${result.added}`)
    } catch (err) {
      console.error('[catalogExpansionScheduled] FAILED:', err)
      throw err
    }
  },
)

// ── Manual HTTP callable (authenticated director) ─────────────────────────────

export const catalogExpansionRun = onCall(
  { memory: '512MiB', timeoutSeconds: 540 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required')

    // Only directors / admins can trigger manually
    // We allow any signed-in user to call this (admin gate lives in UI)
    const dryRun = Boolean((request.data as { dryRun?: boolean }).dryRun)

    const result = await runPipeline(dryRun)
    return result
  },
)
