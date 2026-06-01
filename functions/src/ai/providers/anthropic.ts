/**
 * Anthropic provider adapter.
 * Enforces no-training via the anthropic-beta header.
 */
import type { ProviderAdapter, ProviderRequest, ProviderResponse } from './types.js'

export const anthropicAdapter: ProviderAdapter = {
  name: 'anthropic',

  async call(request: ProviderRequest, apiKey: string): Promise<ProviderResponse> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'no-training',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.params?.maxTokens ?? 1024,
        temperature: request.params?.temperature ?? 0.7,
        messages: [{ role: 'user', content: request.prompt }],
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Anthropic API error ${res.status}: ${body}`)
    }

    const json = (await res.json()) as {
      content: Array<{ type: string; text: string }>
      usage: { input_tokens: number; output_tokens: number }
      model: string
    }

    return {
      text: json.content.filter(b => b.type === 'text').map(b => b.text).join(''),
      inputTokens: json.usage.input_tokens,
      outputTokens: json.usage.output_tokens,
      model: json.model,
    }
  },
}
