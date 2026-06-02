/**
 * Pure-TS chord transposer.
 *
 * Handles tokens like "Bm7/D#", "Csus2/G", "Abmaj7", "F#dim", enharmonic
 * edge cases (B#, Cb, E#, Fb), and a flat/sharp preference toggle.
 */

// ── Note tables ──────────────────────────────────────────────────────────────

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
const FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const

/** Map every recognised note name (including enharmonic equivalents) to a
 *  semitone index 0-11. */
const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
}

export type AccidentalPreference = 'sharp' | 'flat'

// ── Helpers ──────────────────────────────────────────────────────────────────

function semitoneToNote(semitone: number, prefer: AccidentalPreference): string {
  const idx = ((semitone % 12) + 12) % 12
  return prefer === 'flat' ? FLATS[idx] : SHARPS[idx]
}

/**
 * Regex that captures a root note at the start of a chord token.
 * Group 1 = root (e.g. "C#", "Bb", "G").
 * The rest of the string is the suffix (quality + extensions).
 */
const ROOT_RE = /^([A-G][#b]?)/

/**
 * Transpose a single root note by `delta` semitones.
 * Returns the transposed note or the original string if unrecognised.
 */
function transposeRoot(
  root: string,
  delta: number,
  prefer: AccidentalPreference,
): string {
  const semi = NOTE_TO_SEMITONE[root]
  if (semi === undefined) return root
  return semitoneToNote(semi + delta, prefer)
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Transpose a chord token by `delta` semitones.
 *
 * Handles:
 * - Simple chords: `G`, `Am`, `F#`
 * - Extensions: `Cmaj7`, `Dm7`, `Bbsus4`, `G7`
 * - Slash / bass: `Bm7/D#`, `C/E`, `Am/G`
 *
 * @param token   – The chord string, e.g. `"Bm7/D#"`.
 * @param delta   – Semitones to shift (positive = up, negative = down).
 * @param prefer  – Whether to spell accidentals as sharps or flats.
 * @returns The transposed chord string.
 */
export function transposeChord(
  token: string,
  delta: number,
  prefer: AccidentalPreference = 'sharp',
): string {
  if (delta === 0) return token

  // Split on slash for bass note handling
  const slashIdx = token.indexOf('/')
  let main = slashIdx === -1 ? token : token.slice(0, slashIdx)
  let bass = slashIdx === -1 ? '' : token.slice(slashIdx + 1)

  // Transpose main chord root
  const mainMatch = main.match(ROOT_RE)
  if (mainMatch) {
    const root = mainMatch[1]
    const suffix = main.slice(root.length)
    main = transposeRoot(root, delta, prefer) + suffix
  }

  // Transpose bass note if present
  if (bass) {
    const bassMatch = bass.match(ROOT_RE)
    if (bassMatch) {
      const bassRoot = bassMatch[1]
      const bassSuffix = bass.slice(bassRoot.length)
      bass = transposeRoot(bassRoot, delta, prefer) + bassSuffix
    }
    return `${main}/${bass}`
  }

  return main
}

/**
 * Transpose an entire chord line (space-separated tokens).
 * Non-chord tokens (lyrics, dashes, pipes) pass through unchanged.
 */
export function transposeChordLine(
  line: string,
  delta: number,
  prefer: AccidentalPreference = 'sharp',
): string {
  if (delta === 0) return line
  return line.replace(/([A-G][#b]?)([a-zA-Z0-9/#+]*)/g, (match) => {
    return transposeChord(match, delta, prefer)
  })
}

/**
 * Compute semitone delta between two key names.
 * Returns a value in the range [0, 11].
 */
export function semitoneDelta(fromKey: string, toKey: string): number {
  const from = NOTE_TO_SEMITONE[fromKey]
  const to = NOTE_TO_SEMITONE[toKey]
  if (from === undefined || to === undefined) return 0
  return ((to - from) % 12 + 12) % 12
}

/**
 * Infer sharp/flat preference from a key name.
 * Keys with flats (Db, Eb, Ab, Bb, F) → 'flat'; others → 'sharp'.
 */
export function inferPreference(key: string): AccidentalPreference {
  const flatKeys = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'])
  // Check the root (strip minor/major suffix)
  const root = key.match(ROOT_RE)?.[1] ?? key
  return flatKeys.has(root) ? 'flat' : 'sharp'
}
