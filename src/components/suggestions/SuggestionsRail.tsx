import { useEffect, useState, useCallback } from 'react'
import { Sparkles, Plus, X, RefreshCw, AlertCircle } from 'lucide-react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Song } from '@/types'

interface SuggestionCandidate {
  songId: string
  score: number
  rationale: string
}

interface SuggestionResult {
  candidates: SuggestionCandidate[]
  model: string
  usedReranker: boolean
}

interface SuggestionsRailProps {
  choirId: string
  choirName?: string
  serviceDate: string
  serviceType?: string
  theme?: string
  scriptureRef?: string
  existingSongIds: string[]
  songs: Song[]
  onAddSong: (song: Song) => void
}

const getSongSuggestions = httpsCallable<
  {
    choirId: string
    serviceDate: string
    serviceType?: string
    theme?: string
    scriptureRef?: string
    existingSongIds?: string[]
    choirName?: string
  },
  SuggestionResult
>(functions, 'getSongSuggestions')

const submitFeedback = httpsCallable<
  { choirId: string; songId: string; action: string; serviceId?: string },
  { ok: boolean }
>(functions, 'submitSuggestionFeedback')

export function SuggestionsRail({
  choirId,
  choirName,
  serviceDate,
  serviceType,
  theme,
  scriptureRef,
  existingSongIds,
  songs,
  onAddSong,
}: SuggestionsRailProps) {
  const [candidates, setCandidates] = useState<SuggestionCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const fetchSuggestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getSongSuggestions({
        choirId,
        serviceDate,
        serviceType,
        theme,
        scriptureRef,
        existingSongIds,
        choirName,
      })
      setCandidates(result.data.candidates)
    } catch (err) {
      setError('Could not load suggestions. Try again later.')
      console.error('Suggestions error:', err)
    } finally {
      setLoading(false)
    }
  }, [choirId, serviceDate, serviceType, theme, scriptureRef, existingSongIds, choirName])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  const handleAccept = (candidate: SuggestionCandidate) => {
    const song = songs.find(s => s.id === candidate.songId)
    if (song) {
      onAddSong(song)
      submitFeedback({ choirId, songId: candidate.songId, action: 'accept' }).catch(() => {})
    }
  }

  const handleDismiss = (candidate: SuggestionCandidate) => {
    setDismissedIds(prev => new Set(prev).add(candidate.songId))
    submitFeedback({ choirId, songId: candidate.songId, action: 'reject' }).catch(() => {})
  }

  const visible = candidates.filter(
    c => !dismissedIds.has(c.songId) && !existingSongIds.includes(c.songId),
  )

  if (loading) {
    return (
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-harmonic-primary" />
          <h3 className="text-sm font-semibold text-harmonic-text">Suggested songs</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28 w-56 flex-shrink-0 rounded-card" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="mb-5 p-4">
        <div className="flex items-center gap-3">
          <AlertCircle size={18} className="text-harmonic-danger flex-shrink-0" />
          <p className="text-sm text-harmonic-muted flex-1">{error}</p>
          <button
            onClick={fetchSuggestions}
            className="text-harmonic-primary hover:opacity-80 transition-opacity"
            aria-label="Retry loading suggestions"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </Card>
    )
  }

  if (visible.length === 0 && candidates.length === 0) {
    return (
      <Card className="mb-5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-harmonic-primary" />
          <h3 className="text-sm font-semibold text-harmonic-text">Suggested songs</h3>
        </div>
        <p className="text-sm text-harmonic-muted">
          Based on this Sunday's lectionary themes — your suggestions get smarter as you build set lists.
        </p>
      </Card>
    )
  }

  if (visible.length === 0) return null

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-harmonic-primary" />
          <h3 className="text-sm font-semibold text-harmonic-text">Suggested songs</h3>
          <span className="text-[10px] font-medium text-harmonic-primary bg-harmonic-primary/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            AI
          </span>
        </div>
        <button
          onClick={fetchSuggestions}
          className="text-harmonic-muted hover:text-harmonic-primary transition-colors"
          aria-label="Refresh suggestions"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {visible.slice(0, 8).map(candidate => {
          const song = songs.find(s => s.id === candidate.songId)
          return (
            <SuggestionCard
              key={candidate.songId}
              candidate={candidate}
              song={song}
              onAccept={() => handleAccept(candidate)}
              onDismiss={() => handleDismiss(candidate)}
            />
          )
        })}
      </div>
    </div>
  )
}

function SuggestionCard({
  candidate,
  song,
  onAccept,
  onDismiss,
}: {
  candidate: SuggestionCandidate
  song?: Song
  onAccept: () => void
  onDismiss: () => void
}) {
  const title = song?.title ?? candidate.songId
  const artist = song?.artist
  const songKey = song?.defaultKey

  return (
    <Card className="w-56 flex-shrink-0 p-3 snap-start relative group">
      <button
        onClick={onDismiss}
        aria-label={`Dismiss ${title}`}
        className="absolute top-2 right-2 text-harmonic-muted hover:text-harmonic-danger transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={14} />
      </button>

      <div className="mb-2">
        <p className="text-sm font-semibold text-harmonic-text truncate pr-5">{title}</p>
        {artist && <p className="text-xs text-harmonic-muted truncate">{artist}</p>}
        {songKey && (
          <span className="inline-block mt-1 text-[10px] font-medium text-harmonic-primary bg-harmonic-surface px-1.5 py-0.5 rounded">
            {songKey}
          </span>
        )}
      </div>

      <p className="text-xs text-harmonic-muted line-clamp-2 mb-3 min-h-[2rem]">
        {candidate.rationale}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-harmonic-muted font-medium uppercase tracking-wider">
          Suggested
        </span>
        <button
          onClick={onAccept}
          className="flex items-center gap-1 text-xs font-semibold text-harmonic-primary hover:opacity-80 transition-opacity min-h-[28px] px-2"
          aria-label={`Add ${title} to set list`}
        >
          <Plus size={14} /> Add
        </button>
      </div>
    </Card>
  )
}
