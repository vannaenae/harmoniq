import { useRef, useState, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import type { SatbPart } from '@/types'

const VOICE_LABELS: Record<string, string> = {
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Tenor',
  bass: 'Bass',
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function SatbAudioPlayer({ parts }: { parts: SatbPart[] }) {
  const playable = parts.filter(p => p.audioUrl)
  const [activeVoice, setActiveVoice] = useState(playable[0]?.voice ?? 'soprano')
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const activeUrl = playable.find(p => p.voice === activeVoice)?.audioUrl

  useEffect(() => {
    // Reset when switching voice
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [activeVoice])

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
    } else {
      el.play()
    }
    setPlaying(!playing)
  }

  const restart = () => {
    const el = audioRef.current
    if (!el) return
    el.currentTime = 0
    setCurrentTime(0)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setCurrentTime(val)
    if (audioRef.current) audioRef.current.currentTime = val
  }

  if (playable.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Voice tabs */}
      <div className="flex gap-1.5 overflow-x-auto">
        {playable.map(p => (
          <button
            key={p.voice}
            onClick={() => setActiveVoice(p.voice)}
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

      {/* Player */}
      {activeUrl && (
        <div className="flex items-center gap-3 bg-harmonic-surface rounded-xl px-4 py-3">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-harmonic-primary text-white flex items-center justify-center hover:bg-harmonic-primary/90 transition-colors flex-shrink-0"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          <div className="flex-1 min-w-0 space-y-1">
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
            <div className="flex justify-between text-[10px] text-harmonic-muted font-medium">
              <span>{fmtTime(currentTime)}</span>
              <span>{duration ? fmtTime(duration) : '--:--'}</span>
            </div>
          </div>

          <button
            onClick={restart}
            className="w-8 h-8 flex items-center justify-center text-harmonic-muted hover:text-harmonic-text transition-colors flex-shrink-0"
            aria-label="Restart"
          >
            <RotateCcw size={14} />
          </button>

          <audio
            ref={audioRef}
            src={activeUrl}
            preload="metadata"
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
            onEnded={() => setPlaying(false)}
          />
        </div>
      )}
    </div>
  )
}
