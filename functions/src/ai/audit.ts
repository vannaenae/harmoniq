/**
 * AI audit logging — writes structured audit records to Firestore.
 * Does NOT log full prompt content (PII risk).
 */
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { createHash, randomUUID } from 'crypto'

export interface AuditEntry {
  requestId: string
  feature: string
  promptVersion: string
  model: string
  choirId: string
  timestamp: ReturnType<typeof FieldValue.serverTimestamp>
  promptHash: string
  inputTokens: number
  outputTokens: number
  latencyMs: number
  status: 'success' | 'error'
  errorMessage?: string
}

export function generateRequestId(): string {
  return randomUUID()
}

export function hashPrompt(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex')
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  const db = getFirestore()
  await db.collection('aiAuditLog').doc(entry.requestId).set(entry)
}

export async function updateCostTelemetry(
  choirId: string,
  feature: string,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  const db = getFirestore()
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const docRef = db.collection('aiUsage').doc(choirId).collection(monthKey).doc(feature)

  await docRef.set(
    {
      totalRequests: FieldValue.increment(1),
      totalInputTokens: FieldValue.increment(inputTokens),
      totalOutputTokens: FieldValue.increment(outputTokens),
      lastUsed: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )
}
