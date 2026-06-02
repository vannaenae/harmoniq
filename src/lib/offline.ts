import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { Song } from '@/types'

// ── Cache names (must match workbox runtime caching) ────────────────────────
const ASSET_CACHE = 'offline-song-assets'

// ── Service-worker asset pre-warming ────────────────────────────────────────

/** Collect cacheable asset URLs from a Song record. */
function collectAssetUrls(song: Song): string[] {
  const urls: string[] = []
  if (song.albumArtUrl) urls.push(song.albumArtUrl)
  if (song.chordChartUrl) urls.push(song.chordChartUrl)
  if (song.sheetMusicUrl) urls.push(song.sheetMusicUrl)
  if (song.leadSheetUrl) urls.push(song.leadSheetUrl)
  song.satbParts?.forEach(p => {
    if (p.audioUrl) urls.push(p.audioUrl)
    if (p.pdfUrl) urls.push(p.pdfUrl)
  })
  return urls
}

/** Pre-cache a song's assets via the Cache API so they're available offline. */
async function warmAssetCache(song: Song): Promise<void> {
  const urls = collectAssetUrls(song)
  if (urls.length === 0) return

  const cache = await caches.open(ASSET_CACHE)
  await Promise.allSettled(
    urls.map(async url => {
      const existing = await cache.match(url)
      if (!existing) {
        const resp = await fetch(url, { mode: 'cors', credentials: 'omit' })
        if (resp.ok) await cache.put(url, resp)
      }
    }),
  )
}

/** Remove a song's cached assets. */
async function evictAssetCache(song: Song): Promise<void> {
  const urls = collectAssetUrls(song)
  if (urls.length === 0) return

  const cache = await caches.open(ASSET_CACHE)
  await Promise.allSettled(urls.map(url => cache.delete(url)))
}

// ── Firestore offline-song marker ───────────────────────────────────────────

function markerRef(uid: string, songId: string) {
  return doc(db, 'users', uid, 'offlineSongs', songId)
}

/** Save a song for offline use: warm the asset cache and write the Firestore marker. */
export async function saveOffline(uid: string, song: Song): Promise<void> {
  await warmAssetCache(song)
  await setDoc(markerRef(uid, song.id), {
    songId: song.id,
    savedAt: serverTimestamp(),
    lastSyncedAt: serverTimestamp(),
  })
}

/** Remove a song from offline: evict cached assets and delete the Firestore marker. */
export async function removeOffline(uid: string, song: Song): Promise<void> {
  await evictAssetCache(song)
  await deleteDoc(markerRef(uid, song.id))
}
