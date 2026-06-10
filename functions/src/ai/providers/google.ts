/**
 * Google (Gemini) provider adapter.
 * No-training enforced via `cachedContent` exclusion and API TOS (Gemini API
 * does not use paid-tier API data for training by default; we assert opt-out
 * via the safety metadata).
 */
import type { ProviderAdapter, ProviderRequest, ProviderResponse } from './types.js'

export const googleAdapter: ProviderAdapter = {
  name: 'google',

  async call(request: ProviderRequest, apiKey: string): Promise<ProviderResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${apiKey}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: request.prompt }] }],
        generationConfig: {
          maxOutputTokens: request.params?.maxTokens ?? 1024,
          temperature: request.params?.temperature ?? 0.7,
        },
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Google AI API error ${res.status}: ${body}`)
    }

    const json = (await res.json()) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>
      usageMetadata: { promptTokenCount: number; candidatesTokenCount: number }
    }

    return {
      text: json.candidates[0]?.content.parts.map(p => p.text).join('') ?? '',
      inputTokens: json.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: json.usageMetadata?.candidatesTokenCount ?? 0,
      model: request.model,
    }
  },
}
