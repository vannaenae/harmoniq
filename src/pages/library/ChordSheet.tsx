import { Fragment, useMemo } from 'react'

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_TO_SHARP: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' }

function transposeRoot(root: string, semis: number): string {
  const norm = FLAT_TO_SHARP[root] ?? root
  const i = SHARPS.indexOf(norm)
  if (i === -1) return root
  return SHARPS[((i + semis) % 12 + 12) % 12]
}

/** Transpose every root inside a chord name — handles suffixes (m7, sus4) and slash chords (D/F#). */
export function transposeChordName(chord: string, semis: number): string {
  if (semis === 0) return chord
  return chord.replace(/[A-G](?:#|b)?/g, m => transposeRoot(m, semis))
}

interface ChordSheetProps {
  /** Sheet text with chords wrapped in [ch]…[/ch] markers */
  text: string
  semitones: number
}

/** Monospace chord sheet with highlighted, transposable chords. */
export function ChordSheet({ text, semitones }: ChordSheetProps) {
  const parts = useMemo(() => text.split(/(\[ch\].*?\[\/ch\])/g), [text])

  return (
    <pre className="font-mono text-[13px] leading-6 text-harmonic-text whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        const m = part.match(/^\[ch\](.*?)\[\/ch\]$/)
        if (m) {
          return (
            <span key={i} className="font-bold text-harmonic-primary">
              {transposeChordName(m[1], semitones)}
            </span>
          )
        }
        return <Fragment key={i}>{part}</Fragment>
      })}
    </pre>
  )
}
