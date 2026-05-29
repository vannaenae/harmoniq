import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateId } from '@/lib/utils'
import { toDate } from '@/lib/firestore'
import { seedCatalogueAsSongs } from '@/lib/seedCatalogue'
import type { Song, SongGenre } from '@/types'

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
  lyricsUrl?: string
  notes?: string
  sheetMusicUrl?: string
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
    lyricsUrl: input.lyricsUrl ?? null,
    geniusUrl: input.lyricsUrl ?? null,
    notes: input.notes ?? null,
    sheetMusicUrl: input.sheetMusicUrl ?? null,
    isCustom: true,
    choirId,
    addedBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return id
}

/** Persist resolved Spotify/Genius data back onto a custom song to avoid repeat calls. */
export async function cacheSongMedia(
  choirId: string,
  songId: string,
  media: { spotifyTrackId?: string | null; albumArtUrl?: string | null; geniusUrl?: string | null },
): Promise<void> {
  if (!songId.startsWith('custom-')) return // global/seed songs are read-only from client
  await setDoc(
    doc(db, 'choirs', choirId, 'songs', songId),
    { ...media, updatedAt: serverTimestamp() },
    { merge: true },
  ).catch(() => {})
}

function mapSong(id: string, data: Record<string, unknown>, choirId?: string): Song {
  return {
    id,
    title: (data.title as string) ?? 'Untitled',
    artist: (data.artist as string) ?? undefined,
    genre: (data.genre as SongGenre) ?? undefined,
    defaultKey: (data.defaultKey as string) ?? undefined,
    spotifyTrackId: (data.spotifyTrackId as string) ?? undefined,
    albumArtUrl: (data.albumArtUrl as string) ?? undefined,
    geniusUrl: (data.geniusUrl as string) ?? undefined,
    lyricsUrl: (data.lyricsUrl as string) ?? undefined,
    notes: (data.notes as string) ?? undefined,
    sheetMusicUrl: (data.sheetMusicUrl as string) ?? undefined,
    isCustom: Boolean(data.isCustom),
    choirId,
    addedBy: (data.addedBy as string) ?? 'seed',
    createdAt: data.createdAt ? toDate(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? toDate(data.updatedAt) : new Date(),
  }
}

export const ALL_KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B']
export const GENRES: SongGenre[] = ['Gospel', 'Contemporary', 'Hymn', 'Modern', 'Anthem', 'Other']
