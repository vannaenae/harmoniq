/**
 * AI Gateway — unified provider client with audit logging,
 * no-training enforcement, rate limiting, and cost telemetry.
 *
 * Usage from any Cloud Function:
 *   import { aiGateway } from './ai/gateway.js'
 *   const result = await aiGateway.callModel({
 *     feature: 'song-context',
 *     model: 'claude-haiku-4-5-20251001',
 *     prompt: '...',
 *     choirId: 'abc123',
 *   })
 */
import { FieldValue } from 'firebase-admin/firestore'
import { anthropicAdapter } from './providers/anthropic.js'
import { openaiAdapter } from './providers/openai.js'
import { googleAdapter } from './providers/google.js'
import type { ProviderAdapter } from './providers/types.js'
import { generateRequestId, hashPrompt, writeAuditLog, updateCostTelemetry } from './audit.js'
import { checkRateLimit, RateLimitExceededError } from './rate-limiter.js'

const BLOCKED_FEATURES = new Set(['biometric_id'])

export interface CallModelRequest {
  feature: string
  promptVersion?: string
  model: string
  prompt: string
  params?: {
    maxTokens?: number
    temperature?: number
  }
  choirId: string
}

export interface CallModelResponse {
  requestId: string
  text: string
  model: string
  inputTokens: number
  outputTokens: number
  latencyMs: number
}

export class BiometricBlockedError extends Error {
  constructor() {
    super('Biometric identification features are permanently blocked by privacy policy.')
    this.name = 'BiometricBlockedError'
  }
}

function resolveProvider(model: string): { adapter: ProviderAdapter; secretName: string } {
  if (model.startsWith('claude-') || model.startsWith('anthropic/')) {
    return { adapter: anthropicAdapter, secretName: 'ANTHROPIC_API_KEY' }
  }
  if (model.startsWith('gpt-') || model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4')) {
    return { adapter: openaiAdapter, secretName: 'OPENAI_API_KEY' }
  }
  if (model.startsWith('gemini-')) {
    return { adapter: googleAdapter, secretName: 'GOOGLE_AI_API_KEY' }
  }
  throw new Error(`Unknown model prefix: ${model}. Cannot resolve provider.`)
}

class AIGateway {
  private apiKeys: Map<string, string> = new Map()

  /**
   * Register a secret value at runtime (called during function initialization).
   */
  setApiKey(secretName: string, value: string): void {
    this.apiKeys.set(secretName, value)
  }

  /**
   * Primary entry point for all AI calls.
   */
  async callModel(request: CallModelRequest): Promise<CallModelResponse> {
    // Privacy doctrine: reject biometric identification features
    if (BLOCKED_FEATURES.has(request.feature)) {
      throw new BiometricBlockedError()
    }

    const requestId = generateRequestId()
    const promptHash = hashPrompt(request.prompt)
    const { adapter, secretName } = resolveProvider(request.model)

    const apiKey = this.apiKeys.get(secretName)
    if (!apiKey) {
      throw new Error(`API key not configured for ${secretName}. Call aiGateway.setApiKey() first.`)
    }

    // Rate limit check (fail closed)
    try {
      await checkRateLimit(request.choirId, request.feature)
    } catch (err) {
      if (err instanceof RateLimitExceededError) {
        await writeAuditLog({
          requestId,
          feature: request.feature,
          promptVersion: request.promptVersion ?? 'unknown',
          model: request.model,
          choirId: request.choirId,
          timestamp: FieldValue.serverTimestamp(),
          promptHash,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs: 0,
          status: 'error',
          errorMessage: err.message,
        })
        throw err
      }
      throw err
    }

    const startTime = Date.now()
    try {
      const response = await adapter.call(
        {
          model: request.model,
          prompt: request.prompt,
          params: request.params,
        },
        apiKey,
      )

      const latencyMs = Date.now() - startTime

      // Fire audit + cost telemetry in parallel (don't block response)
      await Promise.all([
        writeAuditLog({
          requestId,
          feature: request.feature,
          promptVersion: request.promptVersion ?? 'unknown',
          model: response.model,
          choirId: request.choirId,
          timestamp: FieldValue.serverTimestamp(),
          promptHash,
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
          latencyMs,
          status: 'success',
        }),
        updateCostTelemetry(
          request.choirId,
          request.feature,
          response.inputTokens,
          response.outputTokens,
        ),
      ])

      return {
        requestId,
        text: response.text,
        model: response.model,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        latencyMs,
      }
    } catch (err) {
      const latencyMs = Date.now() - startTime
      const errorMessage = err instanceof Error ? err.message : String(err)

      await writeAuditLog({
        requestId,
        feature: request.feature,
        promptVersion: request.promptVersion ?? 'unknown',
        model: request.model,
        choirId: request.choirId,
        timestamp: FieldValue.serverTimestamp(),
        promptHash,
        inputTokens: 0,
        outputTokens: 0,
        latencyMs,
        status: 'error',
        errorMessage,
      })

      throw err
    }
  }
}

export const aiGateway = new AIGateway()
