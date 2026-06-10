/**
 * LyricsAutoFetch — auto-fetch lyrics from lyrics.ovh.
 *
 * Renders a compact card with a "Fetch lyrics" button. On success it surfaces
 * the raw lyrics text for preview. The parent decides what to do with the text
 * (e.g. store to Firestore, populate a textarea).
 */
import { useState } from 'react'
import { Sparkles, Check, AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { fetchAutoLyrics, type AutoLyricsResult } from '@harmoniq/shared'

const SOURCE_LABEL: Record<AutoLyricsResult['source'], string> = {
  'lyrics.ovh': 'lyrics.ovh',
  cache:        'cache',
  none:         '',
}

interface Props {
  title: string
  artist?: string
  /** Called when lyrics are successfully fetched. */
  onFetched: (lyrics: string, source: AutoLyricsResult['source']) => void
  /** Optional: if lyrics are already present, show a "re-fetch" variant. */
  hasExistingLyrics?: boolean
  /** Only show the button if true (director-only gate handled by parent). */
  enabled?: boolean
}

export function LyricsAutoFetch({ title, artist, onFetched, hasExistingLyrics = false, enabled = true }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'not_found' | 'error'>('idle')
  const [source, setSource] = useState<AutoLyricsResult['source']>('none')

  if (!enabled) return null

  const handleFetch = async () => {
    if (!title.trim()) return
    setState('loading')
    try {
      const result = await fetchAutoLyrics(title, artist)
      if (result.lyrics) {
        setSource(result.source)
        setState('success')
        onFetched(result.lyrics, result.source)
      } else {
        setState('not_found')
      }
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
        <Check size={15} className="flex-shrink-0" />
        <span>
          Lyrics fetched from <span className="font-semibold">{SOURCE_LABEL[source]}</span>
        </span>
      </div>
    )
  }

  if (state === 'not_found') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-harmonic-surface border border-harmonic-border px-4 py-3 text-sm text-harmonic-muted">
        <AlertTriangle size={15} className="flex-shrink-0" />
        <span>No lyrics found for this song.</span>
        <a
          href={`https://genius.com/search?q=${encodeURIComponent(`${title} ${artist ?? ''}`.trim())}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-harmonic-primary hover:underline text-xs font-medium"
        >
          <ExternalLink size={12} /> Search Genius
        </a>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        <AlertTriangle size={15} className="flex-shrink-0" />
        <span>Lyrics fetch failed. Try again or add lyrics manually.</span>
        <button
          onClick={() => setState('idle')}
          className="ml-auto text-xs font-medium text-red-600 hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <Button
      variant="outlined"
      onClick={handleFetch}
      disabled={state === 'loading' || !title.trim()}
    >
      <Sparkles size={15} />
      {state === 'loading'
        ? 'Fetching lyrics…'
        : hasExistingLyrics
        ? 'Re-fetch lyrics'
        : 'Auto-fetch lyrics'}
    </Button>
  )
}
