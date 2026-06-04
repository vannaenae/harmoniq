import { useRef, useEffect, useState } from 'react'
import { Play, Pause, X, ChevronDown, ChevronUp, Music2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAudioPlayerStore } from '@/store/audioPlayerStore'

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function PersistentAudioPlayer() {
  const { track, playing, setPlaying, close } = useAudioPlayerStore()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [expanded, setExpanded] = useState(false)

  // When track changes, reset position
  useEffect(() => {
    setCurrentTime(0)
    setDuration(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }, [track?.url])

  // Sync play/pause state to audio element
  useEffect(() => {
    const el = audioRef.current
    if (!el || !track) return
    if (playing) {
      el.play().catch(() => setPlaying(false))
    } else {
      el.pause()
    }
  }, [playing, track, setPlaying])

  const togglePlay = () => {
    setPlaying(!playing)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setCurrentTime(val)
    if (audioRef.current) audioRef.current.currentTime = val
  }

  if (!track) return null

  const voiceLabel = track.voice ? ` · ${track.voice}` : ''
  const sourceLabel = track.source === 'spotify_preview' ? '30s preview' : 'Practice audio'

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-40 bg-white border-t border-harmonic-border shadow-lg transition-all duration-300',
        'md:left-64', // sidebar offset on desktop
        expanded ? 'bottom-0 md:bottom-0' : 'bottom-16 md:bottom-0',
      )}
    >
      {/* Hidden audio element */}
      {track.url && (
        <audio
          ref={audioRef}
          src={track.url}
          preload="metadata"
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
          onEnded={() => setPlaying(false)}
        />
      )}

      {/* Expanded view */}
      {expanded && (
        <div className="px-5 pt-5 pb-3 space-y-4">
          {/* Album art + info */}
          <div className="flex items-center gap-4">
            {track.artUrl ? (
              <img
                src={track.artUrl}
                alt=""
                aria-hidden="true"
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-harmonic-surface flex items-center justify-center flex-shrink-0">
                <Music2 size={24} className="text-harmonic-muted" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-harmonic-text text-base truncate">{track.title}</p>
              <p className="text-sm text-harmonic-muted truncate">{track.artist}{voiceLabel}</p>
              <p className="text-xs text-harmonic-primary font-medium mt-0.5">{sourceLabel}</p>
            </div>
          </div>

          {/* Seek bar */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 accent-harmonic-primary cursor-pointer"
              aria-label="Seek"
            />
            <div className="flex justify-between text-xs text-harmonic-muted font-medium">
              <span>{fmtTime(currentTime)}</span>
              <span>{duration ? fmtTime(duration) : '--:--'}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 pb-2">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-harmonic-primary text-white flex items-center justify-center hover:bg-harmonic-primary/90 transition-colors"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Mini bar — always visible when player is active */}
      <div
        className="flex items-center gap-3 px-4 h-14 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
        role="button"
        aria-label={expanded ? 'Collapse player' : 'Expand player'}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpanded(v => !v) }}
      >
        {/* Play/pause — stop propagation so click doesn't also toggle expand */}
        <button
          onClick={e => { e.stopPropagation(); togglePlay() }}
          className="w-9 h-9 rounded-full bg-harmonic-primary text-white flex items-center justify-center hover:bg-harmonic-primary/90 transition-colors flex-shrink-0"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
        </button>

        {/* Track info + progress */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-harmonic-text truncate leading-tight">
            {track.title}{voiceLabel}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 bg-harmonic-border rounded-full overflow-hidden">
              <div
                className="h-full bg-harmonic-primary rounded-full transition-all"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-[10px] text-harmonic-muted font-medium flex-shrink-0">
              {duration ? fmtTime(duration) : '--:--'}
            </span>
          </div>
        </div>

        {/* Expand chevron */}
        <div className="text-harmonic-muted flex-shrink-0">
          {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {/* Close */}
        <button
          onClick={e => { e.stopPropagation(); close() }}
          className="w-8 h-8 flex items-center justify-center text-harmonic-muted hover:text-harmonic-text transition-colors flex-shrink-0"
          aria-label="Close player"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
