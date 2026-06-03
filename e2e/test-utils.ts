import { type Song, type SongGenre, type SongOverride, type Language, type LyricSection } from '@/types'
import { type AuthContextType } from '@/contexts/AuthContext'
import { type ChoirContextType } from '@/contexts/ChoirContext'

// This map will store the mock song data
const mockSongsMap = new Map<string, Song>()

export function setMockSongs(songs: Song[]) {
  mockSongsMap.clear()
  songs.forEach(song => mockSongsMap.set(song.id, song))
}

export async function getSong(choirId: string, songId: string): Promise<Song | null> {
  return Promise.resolve(mockSongsMap.get(songId) || null)
}

// Dummy exports for other functions in src/lib/songs.ts to prevent import errors
export const listSongs = async () => Promise.resolve([])
export const addCustomSong = async () => Promise.resolve('mock-id')
export const updateCustomSong = async () => Promise.resolve()
export const deleteCustomSong = async () => Promise.resolve()
export const cacheSongMedia = async () => Promise.resolve()
export const getPracticeNotes = async () => Promise.resolve('')
export const savePracticeNotes = async () => Promise.resolve()
export const ALL_KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
export const GENRES: SongGenre[] = ['Gospel', 'Contemporary', 'Hymn', 'Modern', 'Anthem', 'Other']
export const subscribeSongs = () => () => {} // returns an unsubscribe function
export const subscribeSongOverride = () => () => {}
export const subscribeSongOverrides = () => () => {}
export const saveSongOverride = async () => Promise.resolve()
export const getSongOverride = async () => Promise.resolve(null)

// Mock for SongOverrideInput type
export type SongOverrideInput = Partial<
  Pick<SongOverride, 'performanceKey' | 'keyLocked' | 'rehearsalNotes' | 'capoHint' | 'archived' | 'preferredLanguage'>
>

// Function to generate diverse mock songs
export function generateMockSongs(count: number): Song[] {
  const songs: Song[] = []
  const now = new Date()

  const lyricSections: LyricSection[] = [
    { kind: 'verse', number: 1, lines: ['Verse 1, Line 1', 'Verse 1, Line 2'], language: 'en' },
    { kind: 'chorus', number: 1, lines: ['Chorus, Line 1', 'Chorus, Line 2'], language: 'en' },
  ]

  for (let i = 0; i < count; i++) {
    const id = `mock-song-${i}`
    const hasLyrics = i % 2 === 0
    const hasSpotify = i % 3 === 0
    const hasYoutube = i % 4 === 0
    const hasAlbumArt = i % 5 === 0
    const hasSheetMusic = i % 6 === 0
    const hasChordChart = i % 7 === 0
    const hasLeadSheet = i % 8 === 0
    const hasSatb = i % 9 === 0
    const isCustom = i % 10 === 0

    songs.push({
      id,
      origin: isCustom ? 'custom' : 'seed',
      title: `Mock Song ${i + 1}`,
      artist: `Mock Artist ${i % 5}`,
      primaryLanguage: 'en',
      availableLanguages: ['en'],
      genre: GENRES[i % GENRES.length],
      defaultKey: ALL_KEYS[i % ALL_KEYS.length],
      meta: {
        ...(hasSpotify && { durationSec: (i + 1) * 60 }),
        themes: i % 2 === 0 ? [`theme-${i}`, `another-theme-${i}`] : undefined,
      },
      rights: { status: i % 2 === 0 ? 'ccli_required' : 'unknown' },
      media: {
        ...(hasSpotify && { spotifyTrackId: `spotify-track-${i}` }),
        ...(hasYoutube && { youtubeVideoId: `youtube-video-${i}` }),
        ...(hasYoutube && i % 2 === 0 && { youtubeOfficialAudioId: `youtube-audio-${i}` }),
      },
      lyrics: hasLyrics ? lyricSections : [],
      sheetMusicUrl: hasSheetMusic ? `https://example.com/sheet-${i}.pdf` : undefined,
      chordChartUrl: hasChordChart ? `https://example.com/chord-${i}.pdf` : undefined,
      leadSheetUrl: hasLeadSheet ? `https://example.com/lead-${i}.pdf` : undefined,
      satbParts: hasSatb ? [
        { voice: 'soprano', audioUrl: `https://example.com/soprano-${i}.mp3` },
        { voice: 'alto', audioUrl: `https://example.com/alto-${i}.mp3` },
      ] : undefined,
      albumArtUrl: hasAlbumArt ? `https://picsum.photos/seed/${i}/200/200` : undefined,
      tags: i % 3 === 0 ? [`tag-${i}`, `another-tag-${i}`] : undefined,
      choirId: 'mock-choir-id',
      addedBy: 'mock-user-id',
      createdAt: now,
      updatedAt: now,
      isCustom: isCustom,

      // Transitional compat
      spotifyTrackId: hasSpotify ? `spotify-track-${i}` : undefined,
      geniusUrl: hasLyrics ? `https://genius.com/mock-song-${i}` : undefined,
      lyricsUrl: hasLyrics ? `https://lyrics.com/mock-song-${i}` : undefined,
      notes: i % 4 === 0 ? `Practice notes for song ${i+1}` : undefined,
    })
  }
  return songs
}

// Mock useAuth hook
export const mockUseAuth: () => AuthContextType = () => ({
  firebaseUser: { uid: 'mock-user-id', email: 'mock@example.com' } as any,
  loading: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  sendPasswordReset: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
})

// Mock useChoir hook
export const mockUseChoir: () => ChoirContextType = () => ({
  choir: { id: 'mock-choir-id', name: 'Mock Choir', profileImageUrl: '' },
  loading: false,
  isDirector: true,
  unreadCount: 0,
  refreshChoir: async () => {},
  refreshMembers: async () => {},
  refreshUnread: async () => {},
})
