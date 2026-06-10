/**
 * songMedia — Cloud Storage trigger for song media uploads.
 *
 * Validates file size (15 MB limit), MIME type (PDF for sheets/chords,
 * MP3 for SATB audio), and writes the download URL through to the
 * corresponding Song document field.
 *
 * Storage path convention:
 *   choirs/{cid}/songMedia/{songId}/{kind}.{ext}
 *
 * Kinds:  chord_chart | sheet_music | lead_sheet | satb_soprano | satb_alto | satb_tenor | satb_bass
 */
import { onObjectFinalized } from 'firebase-functions/v2/storage'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB

const PDF_KINDS = new Set(['chord_chart', 'sheet_music', 'lead_sheet'])
const SATB_KINDS = new Set(['satb_soprano', 'satb_alto', 'satb_tenor', 'satb_bass'])

const KIND_TO_FIELD: Record<string, string> = {
  chord_chart: 'chordChartUrl',
  sheet_music: 'sheetMusicUrl',
  lead_sheet: 'leadSheetUrl',
}

export const onSongMediaUploaded = onObjectFinalized(async (event) => {
  const filePath = event.data.name
  if (!filePath) return

  // Only handle files in the songMedia path
  const match = filePath.match(
    /^choirs\/([^/]+)\/songMedia\/([^/]+)\/([^/]+)\.(pdf|mp3)$/,
  )
  if (!match) return

  const [, choirId, songId, kind, ext] = match
  const contentType = event.data.contentType ?? ''
  const size = Number(event.data.size ?? 0)

  const storage = getStorage()
  const bucket = storage.bucket(event.data.bucket)
  const file = bucket.file(filePath)

  // Size validation
  if (size > MAX_FILE_SIZE) {
    console.warn(`songMedia: ${filePath} exceeds ${MAX_FILE_SIZE / 1024 / 1024} MB limit (${size}). Deleting.`)
    await file.delete().catch(() => {})
    return
  }

  // MIME validation
  if (PDF_KINDS.has(kind) && contentType !== 'application/pdf') {
    console.warn(`songMedia: ${filePath} has invalid MIME ${contentType} for PDF kind. Deleting.`)
    await file.delete().catch(() => {})
    return
  }
  if (SATB_KINDS.has(kind) && !contentType.startsWith('audio/')) {
    console.warn(`songMedia: ${filePath} has invalid MIME ${contentType} for audio kind. Deleting.`)
    await file.delete().catch(() => {})
    return
  }

  // Generate signed URL (valid 100 years — effectively permanent for Storage-served files)
  // Alternative: use getDownloadURL via the Firebase client SDK pattern
  await file.makePublic().catch(() => {})
  const publicUrl = `https://storage.googleapis.com/${event.data.bucket}/${filePath}`

  const db = getFirestore()
  const songRef = db.collection('choirs').doc(choirId).collection('songs').doc(songId)

  if (PDF_KINDS.has(kind)) {
    const field = KIND_TO_FIELD[kind]
    if (field) {
      await songRef.set({ [field]: publicUrl, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
    }
  } else if (SATB_KINDS.has(kind)) {
    const voice = kind.replace('satb_', '') as 'soprano' | 'alto' | 'tenor' | 'bass'
    // Read existing satbParts, upsert the voice entry
    const snap = await songRef.get()
    const existing: Array<{ voice: string; audioUrl?: string; pdfUrl?: string }> =
      snap.exists ? (snap.data()?.satbParts ?? []) : []

    const filtered = existing.filter(p => p.voice !== voice)
    const urlField = ext === 'pdf' ? 'pdfUrl' : 'audioUrl'
    filtered.push({ voice, [urlField]: publicUrl })

    await songRef.set({ satbParts: filtered, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
  }

  console.log(`songMedia: wrote ${kind} URL for choir=${choirId} song=${songId}`)
})
