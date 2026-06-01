/**
 * Unit tests for the AI Gateway with mock provider.
 *
 * Run: npx jest --config functions/jest.config.js functions/src/ai/__tests__/gateway.test.ts
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// ─── Mock Firestore ──────────────────────────────────────────────────────────
const mockSet = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
const mockGet = jest.fn<() => Promise<{ exists: boolean; data: () => unknown }>>().mockResolvedValue({
  exists: false,
  data: () => ({}),
})
const mockDoc = jest.fn().mockReturnValue({ set: mockSet, get: mockGet })
const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc })

jest.unstable_mockModule('firebase-admin/firestore', () => ({
  getFirestore: () => ({ collection: mockCollection }),
  FieldValue: {
    serverTimestamp: () => 'SERVER_TIMESTAMP',
    increment: (n: number) => `INCREMENT(${n})`,
    arrayUnion: (v: unknown) => `ARRAY_UNION(${JSON.stringify(v)})`,
  },
}))

// ─── Import after mocks ──────────────────────────────────────────────────────
const { aiGateway, BiometricBlockedError } = await import('../gateway.js')
const { hashPrompt } = await import('../audit.js')

describe('AI Gateway', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({ exists: false, data: () => ({}) })
  })

  it('should reject biometric_id feature requests', async () => {
    await expect(
      aiGateway.callModel({
        feature: 'biometric_id',
        model: 'claude-haiku-4-5-20251001',
        prompt: 'test',
        choirId: 'choir1',
      }),
    ).rejects.toThrow(BiometricBlockedError)
  })

  it('should throw when API key not configured', async () => {
    await expect(
      aiGateway.callModel({
        feature: 'song-context',
        model: 'claude-haiku-4-5-20251001',
        prompt: 'test',
        choirId: 'choir1',
      }),
    ).rejects.toThrow(/API key not configured/)
  })

  it('should hash prompts with SHA-256', () => {
    const hash = hashPrompt('test prompt')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    // Same input = same hash
    expect(hashPrompt('test prompt')).toBe(hash)
    // Different input = different hash
    expect(hashPrompt('other prompt')).not.toBe(hash)
  })

  it('should resolve provider from model prefix', async () => {
    // Test that unknown model prefix throws
    await expect(
      aiGateway.callModel({
        feature: 'test',
        model: 'unknown-model',
        prompt: 'test',
        choirId: 'choir1',
      }),
    ).rejects.toThrow(/Unknown model prefix/)
  })
})

describe('Prompt versioning', () => {
  it('should export version and build function from song-context/v1', async () => {
    const { PROMPT_VERSION, buildPrompt } = await import('../prompts/song-context/v1.js')
    expect(PROMPT_VERSION).toBe('song-context/v1')
    const prompt = buildPrompt('Amazing Grace', 'John Newton')
    expect(prompt).toContain('Amazing Grace')
    expect(prompt).toContain('John Newton')
    expect(prompt).toContain('JSON')
  })
})
