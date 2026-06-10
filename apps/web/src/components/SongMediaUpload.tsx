import { useRef, useState } from 'react'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { FileText, Music, Upload, X, Loader2 } from 'lucide-react'
import { storage } from '@harmoniq/shared'

const MAX_PDF_SIZE = 15 * 1024 * 1024 // 15 MB
const MAX_AUDIO_SIZE = 15 * 1024 * 1024

export type SongMediaKind =
  | 'chord_chart'
  | 'sheet_music'
  | 'lead_sheet'
  | 'satb_soprano'
  | 'satb_alto'
  | 'satb_tenor'
  | 'satb_bass'

const KIND_LABELS: Record<SongMediaKind, string> = {
  chord_chart: 'Chord chart',
  sheet_music: 'Sheet music',
  lead_sheet: 'Lead sheet',
  satb_soprano: 'Soprano part',
  satb_alto: 'Alto part',
  satb_tenor: 'Tenor part',
  satb_bass: 'Bass part',
}

function isAudioKind(kind: SongMediaKind) {
  return kind.startsWith('satb_')
}

interface Props {
  kind: SongMediaKind
  choirId: string
  songId: string
  existingUrl?: string
  onUploaded: (url: string) => void
  onRemoved?: () => void
}

export function SongMediaUpload({ kind, choirId, songId, existingUrl, onUploaded, onRemoved }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const audio = isAudioKind(kind)
  const accept = audio ? 'audio/mpeg,audio/mp3' : 'application/pdf'
  const maxSize = audio ? MAX_AUDIO_SIZE : MAX_PDF_SIZE
  const label = KIND_LABELS[kind]
  const IconComp = audio ? Music : FileText

  const handleFile = async (file: File) => {
    setError(null)

    // MIME validation
    if (!audio && file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.')
      return
    }
    if (audio && !file.type.startsWith('audio/')) {
      setError('Only MP3 audio files are accepted.')
      return
    }
    if (file.size > maxSize) {
      setError(`File must be under ${maxSize / 1024 / 1024} MB.`)
      return
    }

    setUploading(true)
    setFileName(file.name)

    try {
      const ext = audio ? 'mp3' : 'pdf'
      const path = `choirs/${choirId}/songMedia/${songId}/${kind}.${ext}`
      const fRef = storageRef(storage, path)
      await uploadBytes(fRef, file, { contentType: file.type })
      const url = await getDownloadURL(fRef)
      onUploaded(url)
    } catch {
      setError('Upload failed. Please try again.')
      setFileName(null)
    } finally {
      setUploading(false)
    }
  }

  const hasFile = existingUrl || fileName

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-harmonic-text">{label} (optional)</span>

      {hasFile ? (
        <div className="flex items-center gap-3 bg-harmonic-surface rounded-2xl px-4 py-3">
          <IconComp size={18} className="text-harmonic-primary flex-shrink-0" aria-hidden="true" />
          <span className="text-sm text-harmonic-text truncate flex-1">
            {fileName ?? `${label} uploaded`}
          </span>
          {uploading ? (
            <Loader2 size={16} className="animate-spin text-harmonic-muted" />
          ) : (
            <button
              onClick={() => {
                setFileName(null)
                onRemoved?.()
              }}
              aria-label={`Remove ${label}`}
              className="text-harmonic-muted hover:text-harmonic-danger min-w-[32px] min-h-[32px] flex items-center justify-center"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 bg-harmonic-surface border-2 border-dashed border-harmonic-border rounded-2xl px-4 py-4 text-sm text-harmonic-muted hover:border-harmonic-primary/40 transition-colors min-h-[44px]"
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} aria-hidden="true" />
          )}
          {uploading ? 'Uploading...' : `Upload ${label.toLowerCase()}`}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = '' // allow re-selecting same file
        }}
        aria-hidden="true"
      />

      {error && (
        <p className="text-xs text-harmonic-danger">{error}</p>
      )}
    </div>
  )
}
