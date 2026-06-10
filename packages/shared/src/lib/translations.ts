import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from './firebase'
import { toDate } from './firestore'
import type { Language, LyricSection, SongTranslationCache } from '../types'

// ── Language metadata ─────────────────────────────────────────────────────────

export const SUPPORTED_TRANSLATION_LANGUAGES: Language[] = ['yo', 'ig', 'ha', 'fr', 'sw', 'pt']

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  yo: 'Yoruba',
  ig: 'Igbo',
  ha: 'Hausa',
  pcm: 'Pidgin',
  fr: 'French',
  sw: 'Swahili',
  pt: 'Portuguese',
  la: 'Latin',
  other: 'Other',
}

// ── Cloud Function callables ──────────────────────────────────────────────────

const translateSongFn = httpsCallable<
  { songId: string; targetLanguage: Language; choirId: string },
  SongTranslationCache
>(functions, 'translateSong')

const approveTranslationFn = httpsCallable<
  { songId: string; targetLanguage: Language; choirId: string },
  { ok: boolean; reviewedBy: string }
>(functions, 'approveTranslation')

export async function requestTranslation(
  songId: string,
  targetLanguage: Language,
  choirId: string,
): Promise<SongTranslationCache> {
  const result = await translateSongFn({ songId, targetLanguage, choirId })
  return result.data
}

export async function approveTranslation(
  songId: string,
  targetLanguage: Language,
  choirId: string,
): Promise<{ ok: boolean; reviewedBy: string }> {
  const result = await approveTranslationFn({ songId, targetLanguage, choirId })
  return result.data
}

// ── Read translation cache ────────────────────────────────────────────────────

function mapCacheDoc(data: Record<string, unknown>): SongTranslationCache {
  return {
    songId: (data.songId as string) ?? '',
    language: (data.language as Language) ?? 'en',
    sections: (data.sections as LyricSection[]) ?? [],
    translator: (data.translator as 'human' | 'ai') ?? 'ai',
    aiModel: (data.aiModel as string) ?? undefined,
    reviewedBy: (data.reviewedBy as string) ?? undefined,
    createdAt: data.createdAt ? toDate(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? toDate(data.updatedAt) : new Date(),
  }
}

export async function getTranslationCache(
  songId: string,
  language: Language,
): Promise<SongTranslationCache | null> {
  const cacheKey = `${songId}_${language}`
  const snap = await getDoc(doc(db, 'songTranslationCache', cacheKey)).catch(() => null)
  if (!snap?.exists()) return null
  return mapCacheDoc(snap.data())
}

export async function listTranslationsForSong(
  songId: string,
): Promise<SongTranslationCache[]> {
  const q = query(
    collection(db, 'songTranslationCache'),
    where('songId', '==', songId),
  )
  const snap = await getDocs(q).catch(() => null)
  if (!snap) return []
  return snap.docs.map(d => mapCacheDoc(d.data()))
}

export function subscribeTranslationCache(
  songId: string,
  language: Language,
  callback: (cache: SongTranslationCache | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const cacheKey = `${songId}_${language}`
  return onSnapshot(
    doc(db, 'songTranslationCache', cacheKey),
    snap => callback(snap.exists() ? mapCacheDoc(snap.data()) : null),
    onError,
  )
}

// ── Syllable counting ─────────────────────────────────────────────────────────

/** Estimate syllable count for a line of text.
 *  Uses vowel-cluster heuristic — works reasonably for English, Yoruba,
 *  French, Swahili, Portuguese, and Hausa. Not perfect but useful for
 *  side-by-side comparison. */
export function countSyllables(text: string): number {
  if (!text.trim()) return 0
  const words = text.trim().split(/\s+/)
  let total = 0
  for (const word of words) {
    const clean = word.toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûçñ]/g, '')
    if (!clean) continue
    // Count vowel clusters
    const matches = clean.match(/[aeiouyáàâãéèêíìîóòôõúùû]+/gi)
    let count = matches ? matches.length : 1
    // Adjust for silent-e at end (English)
    if (clean.endsWith('e') && count > 1 && !/[aeiouy]e$/i.test(clean)) {
      count--
    }
    total += Math.max(1, count)
  }
  return total
}
