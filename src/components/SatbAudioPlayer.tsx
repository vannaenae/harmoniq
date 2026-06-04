import { Play, Pause } from 'lucide-react'
import type { SatbPart } from '@/types'
import { useAudioPlayerStore } from '@/store/audioPlayerStore'
import { useState } from 'react'

type Voice = 'soprano' | 'alto' | 'tenor' | 'bass'

const VOICE_LABELS: Record<string, string> = {
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Tenor',
  bass: 'Bass',
}

interface SatbAudioPlayerProps {
  parts: SatbPart[]
  /** song title — shown in persistent player */
  songTitle?: string
  /** artist name — shown in persistent player */
  artist?: string
  /** album art URL — shown in persistent player */
  artUrl?: string | null
}

export function SatbAudioPlayer({ parts, songTitle = 'Practice track', artist = '', artUrl }: SatbAudioPlayerProps) {
  const playable = parts.filter(p => p.audioUrl)
  const [activeVoice, setActiveVoice] = useState<Voice>(playable[0]?.voice ?? 'soprano')
  const { track, playing, playTrack, setPlaying } = useAudioPlayerStore()

  if (playable.length === 0) return null

  const activeUrl = playable.find(p => p.voice === activeVoice)?.audioUrl
  const voiceLabel = VOICE_LABELS[activeVoice] ?? activeVoice

  const isThisTrackPlaying =
    track?.url === activeUrl && playing

  const handleVoiceChange = (voice: Voice) => {
    setActiveVoice(voice)
    // If we're currently playing this song's audio, swap to new voice
    const newUrl = playable.find(p => p.voice === voice)?.audioUrl
    if (track?.source === 'satb' && newUrl) {
      playTrack({
        url: newUrl,
        title: songTitle,
        artist,
        source: 'satb',
        voice: VOICE_LABELS[voice] ?? voice,
        artUrl,
      })
    }
  }

  const handleToggle = () => {
    if (!activeUrl) return
    if (track?.url === activeUrl) {
      // Same track — just toggle
      setPlaying(!playing)
    } else {
      // Different track — start this one
      playTrack({
        url: activeUrl,
        title: songTitle,
        artist,
        source: 'satb',
        voice: voiceLabel,
        artUrl,
      })
    }
  }

  return (
    <div className="space-y-3">
      {/* Voice tabs */}
      <div className="flex gap-1.5 overflow-x-auto">
        {playable.map(p => (
          <button
            key={p.voice}
            onClick={() => handleVoiceChange(p.voice as Voice)}
            className={
              activeVoice === p.voice
                ? 'px-3 py-1.5 rounded-full text-xs font-semibold bg-harmonic-primary text-white'
                : 'px-3 py-1.5 rounded-full text-xs font-medium bg-harmonic-surface text-harmonic-muted hover:bg-harmonic-border transition-colors'
            }
          >
            {VOICE_LABELS[p.voice] ?? p.voice}
          </button>
        ))}
      </div>

      {/* Player row */}
      {activeUrl && (
        <div className="flex items-center gap-3 bg-harmonic-surface rounded-xl px-4 py-3">
          <button
            onClick={handleToggle}
            className="w-9 h-9 rounded-full bg-harmonic-primary text-white flex items-center justify-center hover:bg-harmonic-primary/90 transition-colors flex-shrink-0"
            aria-label={isThisTrackPlaying ? 'Pause' : `Play ${voiceLabel} part`}
          >
            {isThisTrackPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-harmonic-text truncate">{voiceLabel} part</p>
            <p className="text-xs text-harmonic-muted mt-0.5">
              {isThisTrackPlaying ? 'Now playing in player below' : 'Tap to play in persistent player'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
