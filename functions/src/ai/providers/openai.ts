/**
 * OpenAI provider adapter.
 * No-training enforced via the `store: false` parameter per request.
 */
import type { ProviderAdapter, ProviderRequest, ProviderResponse } from './types.js'

export const openaiAdapter: ProviderAdapter = {
  name: 'openai',

  async call(request: ProviderRequest, apiKey: string): Promise<ProviderResponse> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.params?.maxTokens ?? 1024,
        temperature: request.params?.temperature ?? 0.7,
        store: false,
        messages: [{ role: 'user', content: request.prompt }],
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`OpenAI API error ${res.status}: ${body}`)
    }

    const json = (await res.json()) as {
      choices: Array<{ message: { content: string } }>
      usage: { prompt_tokens: number; completion_tokens: number }
      model: string
    }

    return {
      text: json.choices[0]?.message?.content ?? '',
      inputTokens: json.usage.prompt_tokens,
      outputTokens: json.usage.completion_tokens,
      model: json.model,
    }
  },
}
