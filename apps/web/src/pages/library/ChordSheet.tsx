import { Fragment, useMemo } from 'react'
import { transposeChord } from '@harmoniq/shared'

/** Transpose every root inside a chord name — handles suffixes (m7, sus4) and slash chords (D/F#). */
export function transposeChordName(chord: string, semis: number): string {
  if (semis === 0) return chord
  return transposeChord(chord, semis)
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
