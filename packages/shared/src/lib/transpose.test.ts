import { describe, it, expect } from 'vitest'
import {
  transposeChord,
  transposeChordLine,
  semitoneDelta,
  inferPreference,
} from './transpose'

// ── transposeChord ───────────────────────────────────────────────────────────

describe('transposeChord', () => {
  it('returns the same chord when delta is 0', () => {
    expect(transposeChord('Am7', 0)).toBe('Am7')
    expect(transposeChord('Bm7/D#', 0)).toBe('Bm7/D#')
  })

  // Chromatic walk-up through all 12 semitones (sharp)
  it('transposes C through chromatic sharps', () => {
    const expected = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    for (let i = 0; i < 12; i++) {
      expect(transposeChord('C', i, 'sharp')).toBe(expected[i])
    }
  })

  // Chromatic walk-up through all 12 semitones (flat)
  it('transposes C through chromatic flats', () => {
    const expected = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
    for (let i = 0; i < 12; i++) {
      expect(transposeChord('C', i, 'flat')).toBe(expected[i])
    }
  })

  // Sharp preference
  it('uses sharp names by default', () => {
    expect(transposeChord('C', 1)).toBe('C#')
    expect(transposeChord('D', -1)).toBe('C#')
  })

  // Flat preference
  it('uses flat names when prefer=flat', () => {
    expect(transposeChord('C', 1, 'flat')).toBe('Db')
    expect(transposeChord('D', -1, 'flat')).toBe('Db')
  })

  // Extensions preserved
  it('preserves chord quality and extensions', () => {
    expect(transposeChord('Am7', 2, 'sharp')).toBe('Bm7')
    expect(transposeChord('Cmaj7', 5, 'flat')).toBe('Fmaj7')
    expect(transposeChord('Gsus4', 3, 'sharp')).toBe('A#sus4')
    expect(transposeChord('Dsus2', -2, 'sharp')).toBe('Csus2')
    expect(transposeChord('Fdim', 1, 'sharp')).toBe('F#dim')
    expect(transposeChord('Eaug', 1, 'flat')).toBe('Faug')
    expect(transposeChord('C7', 7, 'sharp')).toBe('G7')
    expect(transposeChord('Bb9', 2, 'flat')).toBe('C9')
  })

  // Slash chords — both root and bass transposed
  it('transposes slash chord root and bass', () => {
    expect(transposeChord('Bm7/D#', 2, 'sharp')).toBe('C#m7/F')
    expect(transposeChord('C/E', 2, 'sharp')).toBe('D/F#')
    expect(transposeChord('Am/G', -2, 'flat')).toBe('Gm/F')
    expect(transposeChord('Csus2/G', 5, 'flat')).toBe('Fsus2/C')
  })

  // G → A = +2 semitones (acceptance-test scenario)
  it('shifts G → A by +2 and preserves slash bass', () => {
    expect(transposeChord('G', 2, 'sharp')).toBe('A')
    expect(transposeChord('Em', 2, 'sharp')).toBe('F#m')
    expect(transposeChord('C', 2, 'sharp')).toBe('D')
    expect(transposeChord('D/F#', 2, 'sharp')).toBe('E/G#')
  })

  // Enharmonic edge cases
  it('handles B# (enharmonic C)', () => {
    expect(transposeChord('B#', 0, 'sharp')).toBe('B#') // delta 0 → passthrough
    expect(transposeChord('B#', 2, 'sharp')).toBe('D')
  })

  it('handles Cb (enharmonic B)', () => {
    expect(transposeChord('Cb', 1, 'sharp')).toBe('C')
    expect(transposeChord('Cb', 1, 'flat')).toBe('C')
  })

  it('handles E# (enharmonic F)', () => {
    expect(transposeChord('E#', 2, 'sharp')).toBe('G')
  })

  it('handles Fb (enharmonic E)', () => {
    expect(transposeChord('Fb', 1, 'flat')).toBe('F')
  })

  // Negative deltas (transposing down)
  it('transposes down correctly', () => {
    expect(transposeChord('C', -1, 'sharp')).toBe('B')
    expect(transposeChord('C', -2, 'flat')).toBe('Bb')
    expect(transposeChord('D', -12, 'sharp')).toBe('D') // full octave
  })

  // Wrapping past 12
  it('wraps around at 12 semitones', () => {
    expect(transposeChord('C', 12, 'sharp')).toBe('C')
    expect(transposeChord('G', 14, 'sharp')).toBe('A')
  })
})

// ── transposeChordLine ───────────────────────────────────────────────────────

describe('transposeChordLine', () => {
  it('transposes all chords in a space-separated line', () => {
    expect(transposeChordLine('G  Em  C  D', 2, 'sharp')).toBe('A  F#m  D  E')
  })

  it('transposes slash chords in a line', () => {
    expect(transposeChordLine('G  D/F#  Em  C', 2, 'sharp')).toBe('A  E/G#  F#m  D')
  })

  it('returns the same line when delta is 0', () => {
    const line = 'Am  F  C  G'
    expect(transposeChordLine(line, 0)).toBe(line)
  })

  it('handles flat preference across a line', () => {
    expect(transposeChordLine('C  F  G  Am', 1, 'flat')).toBe('Db  Gb  Ab  Bbm')
  })
})

// ── semitoneDelta ────────────────────────────────────────────────────────────

describe('semitoneDelta', () => {
  it('returns 0 for same key', () => {
    expect(semitoneDelta('C', 'C')).toBe(0)
    expect(semitoneDelta('F#', 'F#')).toBe(0)
  })

  it('computes ascending delta', () => {
    expect(semitoneDelta('G', 'A')).toBe(2)
    expect(semitoneDelta('C', 'E')).toBe(4)
    expect(semitoneDelta('C', 'B')).toBe(11)
  })

  it('handles enharmonic keys', () => {
    expect(semitoneDelta('C#', 'Db')).toBe(0)
    expect(semitoneDelta('Gb', 'F#')).toBe(0)
  })

  it('returns 0 for unrecognised keys', () => {
    expect(semitoneDelta('X', 'C')).toBe(0)
  })
})

// ── inferPreference ──────────────────────────────────────────────────────────

describe('inferPreference', () => {
  it('returns flat for flat keys', () => {
    expect(inferPreference('Bb')).toBe('flat')
    expect(inferPreference('Eb')).toBe('flat')
    expect(inferPreference('F')).toBe('flat')
    expect(inferPreference('Ab')).toBe('flat')
    expect(inferPreference('Db')).toBe('flat')
  })

  it('returns sharp for sharp keys', () => {
    expect(inferPreference('C')).toBe('sharp')
    expect(inferPreference('G')).toBe('sharp')
    expect(inferPreference('D')).toBe('sharp')
    expect(inferPreference('A')).toBe('sharp')
    expect(inferPreference('E')).toBe('sharp')
    expect(inferPreference('B')).toBe('sharp')
  })
})
