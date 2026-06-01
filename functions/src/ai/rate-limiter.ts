/**
 * Simple Firestore-backed rate limiter.
 * Per-choir requests/minute and per-feature global cap.
 */
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const DEFAULT_CHOIR_RPM = 30
const DEFAULT_FEATURE_GLOBAL_RPM = 200

interface RateLimitConfig {
  choirRpm?: number
  featureGlobalRpm?: number
}

export class RateLimitExceededError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitExceededError'
  }
}

export async function checkRateLimit(
  choirId: string,
  feature: string,
  config: RateLimitConfig = {},
): Promise<void> {
  const db = getFirestore()
  const now = Date.now()
  const windowStart = now - 60_000
  const choirRpm = config.choirRpm ?? DEFAULT_CHOIR_RPM
  const featureGlobalRpm = config.featureGlobalRpm ?? DEFAULT_FEATURE_GLOBAL_RPM

  // Per-choir rate limit
  const choirRef = db.collection('aiRateLimits').doc(`choir_${choirId}`)
  const choirDoc = await choirRef.get()
  if (choirDoc.exists) {
    const data = choirDoc.data() as { timestamps?: number[] }
    const recent = (data.timestamps ?? []).filter(t => t > windowStart)
    if (recent.length >= choirRpm) {
      throw new RateLimitExceededError(
        `Rate limit exceeded: ${choirRpm} requests/minute per choir`,
      )
    }
  }

  // Per-feature global rate limit
  const featureRef = db.collection('aiRateLimits').doc(`feature_${feature}`)
  const featureDoc = await featureRef.get()
  if (featureDoc.exists) {
    const data = featureDoc.data() as { timestamps?: number[] }
    const recent = (data.timestamps ?? []).filter(t => t > windowStart)
    if (recent.length >= featureGlobalRpm) {
      throw new RateLimitExceededError(
        `Rate limit exceeded: ${featureGlobalRpm} requests/minute for feature "${feature}"`,
      )
    }
  }

  // Record this request timestamp
  await Promise.all([
    choirRef.set({ timestamps: FieldValue.arrayUnion(now) }, { merge: true }),
    featureRef.set({ timestamps: FieldValue.arrayUnion(now) }, { merge: true }),
  ])
}

/**
 * Periodically clean up old timestamps (call from a scheduled function).
 */
export async function cleanupRateLimitEntries(): Promise<void> {
  const db = getFirestore()
  const windowStart = Date.now() - 60_000
  const snapshot = await db.collection('aiRateLimits').get()

  const batch = db.batch()
  for (const doc of snapshot.docs) {
    const data = doc.data() as { timestamps?: number[] }
    const recent = (data.timestamps ?? []).filter(t => t > windowStart)
    batch.update(doc.ref, { timestamps: recent })
  }
  await batch.commit()
}
