import { useEffect, useRef, useState } from 'react'
import { FileText } from 'lucide-react'

/**
 * Renders a first-page thumbnail of a PDF using pdf.js.
 * Falls back to a file icon on error or while loading.
 */
export function PdfThumb({ url, className = '' }: { url: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!url) return
    let cancelled = false

    ;(async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString()

        const pdf = await pdfjsLib.getDocument({ url }).promise
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 1 })

        const canvas = canvasRef.current
        if (!canvas || cancelled) return

        // Scale to fit the canvas container
        const maxW = canvas.parentElement?.clientWidth ?? 200
        const scale = maxW / viewport.width
        const scaled = page.getViewport({ scale })

        canvas.width = scaled.width
        canvas.height = scaled.height

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        await page.render({ canvasContext: ctx, viewport: scaled, canvas } as Parameters<typeof page.render>[0]).promise
        if (!cancelled) setReady(true)
      } catch {
        if (!cancelled) setError(true)
      }
    })()

    return () => { cancelled = true }
  }, [url])

  if (error || !url) {
    return (
      <div className={`flex items-center justify-center bg-harmonic-surface rounded-xl ${className}`}>
        <FileText size={32} className="text-harmonic-muted" />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-harmonic-surface ${className}`}>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText size={32} className="text-harmonic-muted animate-pulse" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-auto transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
