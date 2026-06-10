import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import { generateId } from './utils'
import { toDate } from './firestore'
import { seedCatalogueAsSongs } from './seedCatalogue'
import type { Song, SongGenre, SongOverride, Language } from '../types'

/** All songs available to a choir: the global library plus that choir's custom songs.
 *  Falls back to the bundled curated catalogue if the global /songs collection is
 *  empty (i.e. the seed script hasn't been run yet). */
export async function listSongs(choirId: string): Promise<Song[]> {
  const [globalSnap, customSnap] = await Promise.all([
    getDocs(collection(db, 'songs')).catch(() => null),
    getDocs(collection(db, 'choirs', choirId, 'songs')).catch(() => null),
  ])

  const global: Song[] =
    globalSnap && !globalSnap.empty
      ? globalSnap.docs.map(d => mapSong(d.id, d.data()))
      : seedCatalogueAsSongs()

  const custom: Song[] = customSnap
    ? customSnap.docs.map(d => mapSong(d.id, d.data(), choirId))
    : []

  return [...custom, ...global]
}

/** Real-time listener for all songs (global + custom). Global songs are loaded
 *  once and then merged with the live custom-songs stream. */
export function subscribeSongs(
  choirId: string,
  callback: (songs: Song[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  // Load global songs once (they rarely change)
  let globalSongs: Song[] | null = null
  getDocs(collection(db, 'songs'))
    .then(snap => {
      globalSongs = snap.empty ? seedCatalogueAsSongs() : snap.docs.map(d => mapSong(d.id, d.data()))
    })
    .catch(() => { globalSongs = seedCatalogueAsSongs() })

  const unsub = onSnapshot(
    collection(db, 'choirs', choirId, 'songs'),
    snap => {
      const custom = snap.docs.map(d => mapSong(d.id, d.data(), choirId))
      callback([...custom, ...(globalSongs ?? seedCatalogueAsSongs())])
    },
    onError,
  )
  return unsub
}

export async function getSong(choirId: string, songId: string): Promise<Song | null> {
  // custom first, then global, then seed fallback
  const customRef = doc(db, 'choirs', choirId, 'songs', songId)
  const customSnap = await getDoc(customRef).catch(() => null)
  if (customSnap?.exists()) return mapSong(customSnap.id, customSnap.data(), choirId)

  const globalRef = doc(db, 'songs', songId)
  const globalSnap = await getDoc(globalRef).catch(() => null)
  if (globalSnap?.exists()) return mapSong(globalSnap.id, globalSnap.data())

  return seedCatalogueAsSongs().find(s => s.id === songId) ?? null
}

export interface CustomSongInput {
  title: string
  artist?: string
  defaultKey?: string
  genre?: SongGenre
  lyrics?: Song['lyrics']
  lyricsUrl?: string
  notes?: string
  sheetMusicUrl?: string
  chordChartUrl?: string
  leadSheetUrl?: string
  satbParts?: Array<{ voice: 'soprano' | 'alto' | 'tenor' | 'bass'; audioUrl?: string; pdfUrl?: string; notes?: string }>
  rights?: Song['rights']
  media?: Song['media']
  albumArtUrl?: string
  durationSec?: number
}

export async function addCustomSong(
  choirId: string,
  addedBy: string,
  input: CustomSongInput,
): Promise<string> {
  const id = `custom-${generateId()}`
  await setDoc(doc(db, 'choirs', choirId, 'songs', id), {
    id,
    title: input.title,
    artist: input.artist ?? null,
    defaultKey: input.defaultKey ?? null,
    genre: input.genre ?? 'Other',
    lyrics: input.lyrics ?? [],
    lyricsUrl: input.lyricsUrl ?? null,
    geniusUrl: null,
    notes: input.notes ?? null,
    sheetMusicUrl: input.sheetMusicUrl ?? null,
    chordChartUrl: input.chordChartUrl ?? null,
    leadSheetUrl: input.leadSheetUrl ?? null,
    satbParts: input.satbParts ?? null,
    rights: input.rights ?? { status: 'unknown' },
    media: input.media ?? {},
    albumArtUrl: input.albumArtUrl ?? null,
    meta: { durationSec: input.durationSec ?? null },
    isCustom: true,
    choirId,
    addedBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return id
}

export async function updateCustomSong(
  choirId: string,
  songId: string,
  input: Partial<CustomSongInput>,
): Promise<void> {
  await setDoc(
    doc(db, 'choirs', choirId, 'songs', songId),
    { ...input, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export async function deleteCustomSong(choirId: string, songId: string): Promise<void> {
  await deleteDoc(doc(db, 'choirs', choirId, 'songs', songId))
}

/** Persist resolved Spotify/Apple Music/Genius data back onto a custom song to avoid repeat calls. */
export async function cacheSongMedia(
  choirId: string,
  songId: string,
  media: { spotifyTrackId?: string | null; albumArtUrl?: string | null; geniusUrl?: string | null; appleMusicUrl?: string | null },
): Promise<void> {
  if (!songId.startsWith('custom-')) return // global/seed songs are read-only from client
  await setDoc(
    doc(db, 'choirs', choirId, 'songs', songId),
    { ...media, updatedAt: serverTimestamp() },
    { merge: true },
  ).catch(() => {})
}

function mapSong(id: string, data: Record<string, unknown>, choirId?: string): Song {
  const isCustom = Boolean(data.isCustom)
  const origin = (data.origin as Song['origin']) ?? (isCustom ? 'custom' : 'global')

  // Legacy lyrics (plain string) → structured LyricSection[]
  const lyrics: Song['lyrics'] = Array.isArray(data.lyrics)
    ? (data.lyrics as Song['lyrics'])
    : typeof data.lyrics === 'string' && data.lyrics
      ? [{ kind: 'verse', number: 1, lines: (data.lyrics as string).split('\n'), language: 'en' as const }]
      : []

  return {
    id,
    origin,
    title: (data.title as string) ?? 'Untitled',
    artist: (data.artist as string) ?? undefined,
    primaryLanguage: (data.primaryLanguage as Song['primaryLanguage']) ?? 'en',
    availableLanguages: (data.availableLanguages as Song['availableLanguages']) ?? ['en'],
    genre: (data.genre as SongGenre) ?? undefined,
    defaultKey: (data.defaultKey as string) ?? (data.key as string) ?? undefined,
    meta: (data.meta as Song['meta']) ?? {},
    rights: (data.rights as Song['rights']) ?? { status: 'unknown' },
    media: (data.media as Song['media']) ?? {
      spotifyTrackId: (data.spotifyTrackId as string) ?? undefined,
    },
    lyrics,
    sheetMusicUrl: (data.sheetMusicUrl as string) ?? undefined,
    chordChartUrl: (data.chordChartUrl as string) ?? undefined,
    leadSheetUrl: (data.leadSheetUrl as string) ?? undefined,
    satbParts: Array.isArray(data.satbParts) ? (data.satbParts as Song['satbParts']) : undefined,
    albumArtUrl: (data.albumArtUrl as string) ?? undefined,
    tags: (data.tags as string[]) ?? undefined,
    choirId,
    addedBy: (data.addedBy as string) ?? 'seed',
    createdAt: data.createdAt ? toDate(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? toDate(data.updatedAt) : new Date(),

    // Transitional compat
    isCustom,
    spotifyTrackId: (data.spotifyTrackId as string) ?? (data.media as Record<string, unknown>)?.spotifyTrackId as string ?? undefined,
    geniusUrl: (data.geniusUrl as string) ?? undefined,
    lyricsUrl: (data.lyricsUrl as string) ?? undefined,
    notes: (data.notes as string) ?? undefined,
  }
}

export async function getPracticeNotes(
  choirId: string,
  songId: string,
  userId: string,
): Promise<string> {
  const ref = doc(db, 'choirs', choirId, 'practiceNotes', `${userId}_${songId}`)
  const snap = await getDoc(ref).catch(() => null)
  if (!snap?.exists()) return ''
  return (snap.data().notes as string) ?? ''
}

export async function savePracticeNotes(
  choirId: string,
  songId: string,
  userId: string,
  notes: string,
): Promise<void> {
  const ref = doc(db, 'choirs', choirId, 'practiceNotes', `${userId}_${songId}`)
  await setDoc(ref, { notes, updatedAt: serverTimestamp() }, { merge: true })
}

export const ALL_KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B']
export const GENRES: SongGenre[] = [
  'Gospel', 'African Gospel', 'Contemporary', 'Hymn', 'Modern',
  'Anthem', 'Chorale', 'Spiritual',
  'Yoruba', 'Igbo', 'Hausa', 'Pidgin', 'Other',
]

// ── Song Overrides (per-choir) ──────────────────────────────────────────────

function overrideRef(choirId: string, songId: string) {
  return doc(db, 'choirs', choirId, 'songOverrides', songId)
}

function mapOverride(songId: string, data: DocumentData, choirId: string): SongOverride {
  return {
    songId,
    choirId,
    performanceKey: (data.performanceKey as string) ?? undefined,
    keyLocked: (data.keyLocked as boolean) ?? false,
    rehearsalNotes: (data.rehearsalNotes as string) ?? undefined,
    capoHint: (data.capoHint as number) ?? undefined,
    archived: (data.archived as boolean) ?? false,
    preferredLanguage: (data.preferredLanguage as Language) ?? undefined,
    updatedBy: (data.updatedBy as string) ?? '',
    updatedAt: data.updatedAt ? toDate(data.updatedAt) : new Date(),
  }
}

export async function getSongOverride(
  choirId: string,
  songId: string,
): Promise<SongOverride | null> {
  const snap = await getDoc(overrideRef(choirId, songId)).catch(() => null)
  if (!snap?.exists()) return null
  return mapOverride(songId, snap.data(), choirId)
}

export function subscribeSongOverride(
  choirId: string,
  songId: string,
  callback: (override: SongOverride | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    overrideRef(choirId, songId),
    snap => callback(snap.exists() ? mapOverride(songId, snap.data(), choirId) : null),
    onError,
  )
}

export function subscribeSongOverrides(
  choirId: string,
  callback: (overrides: Map<string, SongOverride>) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, 'choirs', choirId, 'songOverrides'),
    snap => {
      const map = new Map<string, SongOverride>()
      snap.docs.forEach(d => map.set(d.id, mapOverride(d.id, d.data(), choirId)))
      callback(map)
    },
    onError,
  )
}

export type SongOverrideInput = Partial<
  Pick<SongOverride, 'performanceKey' | 'keyLocked' | 'rehearsalNotes' | 'capoHint' | 'archived' | 'preferredLanguage'>
>

export async function saveSongOverride(
  choirId: string,
  songId: string,
  userId: string,
  input: SongOverrideInput,
): Promise<void> {
  await setDoc(
    overrideRef(choirId, songId),
    { ...input, updatedBy: userId, updatedAt: serverTimestamp() },
    { merge: true },
  )
}
