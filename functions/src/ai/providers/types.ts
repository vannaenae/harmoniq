/**
 * Shared types for AI provider abstraction.
 */

export interface ProviderRequest {
  model: string
  prompt: string
  params?: {
    maxTokens?: number
    temperature?: number
  }
}

export interface ProviderResponse {
  text: string
  inputTokens: number
  outputTokens: number
  model: string
}

export interface ProviderAdapter {
  readonly name: string
  call(request: ProviderRequest, apiKey: string): Promise<ProviderResponse>
}
