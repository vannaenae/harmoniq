import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useChoir } from '@harmoniq/shared'
import { getSong } from '@harmoniq/shared'
import type { Song } from '@harmoniq/shared'

const KIND_LABELS: Record<string, string> = {
  chord_chart: 'Chord Chart',
  sheet_music: 'Sheet Music',
  lead_sheet: 'Lead Sheet',
}

function getMediaUrl(song: Song, kind: string): string | undefined {
  switch (kind) {
    case 'chord_chart': return song.chordChartUrl
    case 'sheet_music': return song.sheetMusicUrl
    case 'lead_sheet': return song.leadSheetUrl
    default: return undefined
  }
}

export function PdfViewer() {
  const { songId, kind } = useParams<{ songId: string; kind: string }>()
  const { choir } = useChoir()
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState(0)

  useEffect(() => {
    if (!choir || !songId || !kind) return
    let cancelled = false

    ;(async () => {
      try {
        const song = await getSong(choir.id, songId)
        if (!song || cancelled) { setError('Song not found.'); setLoading(false); return }

        const url = getMediaUrl(song, kind)
        if (!url) { setError('No PDF available for this type.'); setLoading(false); return }

        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString()

        const pdf = await pdfjsLib.getDocument({ url }).promise
        if (cancelled) return
        setPageCount(pdf.numPages)

        const container = containerRef.current
        if (!container) return

        // Render all pages
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return
          const page = await pdf.getPage(i)
          const containerWidth = container.clientWidth
          const viewport = page.getViewport({ scale: 1 })
          const scale = containerWidth / viewport.width
          const scaled = page.getViewport({ scale })

          const canvas = document.createElement('canvas')
          canvas.width = scaled.width
          canvas.height = scaled.height
          canvas.className = 'w-full h-auto shadow-sm rounded-lg mb-4'
          container.appendChild(canvas)

          const ctx = canvas.getContext('2d')
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport: scaled, canvas } as Parameters<typeof page.render>[0]).promise
          }
        }

        setLoading(false)
      } catch {
        if (!cancelled) { setError('Failed to load PDF.'); setLoading(false) }
      }
    })()

    return () => { cancelled = true }
  }, [choir, songId, kind])

  const title = KIND_LABELS[kind ?? ''] ?? 'PDF'

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to={`/library/${songId}`}
            className="w-9 h-9 rounded-full bg-harmonic-surface flex items-center justify-center text-harmonic-muted hover:text-harmonic-text transition-colors"
            aria-label="Back to song"
          >
            <ArrowLeft size={17} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-harmonic-text">{title}</h1>
            {pageCount > 0 && (
              <p className="text-xs text-harmonic-muted">{pageCount} page{pageCount !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText size={48} className="text-harmonic-muted" />
            <p className="text-sm text-harmonic-muted">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 size={32} className="animate-spin text-harmonic-primary" />
            <p className="text-sm text-harmonic-muted">Loading PDF...</p>
          </div>
        ) : null}

        <div ref={containerRef} className="space-y-2" />
      </div>
    </AppLayout>
  )
}
