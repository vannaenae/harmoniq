import { create } from 'zustand'

export interface AudioTrack {
  url: string
  title: string
  artist: string
  /** 'satb' | 'spotify_preview' */
  source: 'satb' | 'spotify_preview'
  /** voice label for SATB tracks e.g. "Soprano" */
  voice?: string
  /** album art URL */
  artUrl?: string | null
}

interface AudioPlayerState {
  track: AudioTrack | null
  playing: boolean
  playTrack: (track: AudioTrack) => void
  setPlaying: (playing: boolean) => void
  close: () => void
}

export const useAudioPlayerStore = create<AudioPlayerState>(set => ({
  track: null,
  playing: false,

  playTrack: (track) => set({ track, playing: true }),

  setPlaying: (playing) => set({ playing }),

  close: () => set({ track: null, playing: false }),
}))
