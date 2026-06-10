import { useEffect, useState } from 'react'
import { FileText, Download, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBytes } from './chatUtils'
import type { MessageAttachment } from '@/types'

const isImage = (a: MessageAttachment) => a.contentType.startsWith('image/')

interface LightboxProps {
  attachment: MessageAttachment
  onClose: () => void
}

function Lightbox({ attachment, onClose }: LightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-label={attachment.name}
    >
      <button
        onClick={onClose}
        aria-label="Close image"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-150"
      >
        <X size={20} aria-hidden="true" />
      </button>
      <img
        src={attachment.url}
        alt={attachment.name}
        className="max-w-full max-h-[82vh] rounded-xl object-contain animate-scale-in"
        onClick={e => e.stopPropagation()}
      />
      <div className="flex items-center gap-3 mt-4 text-white/80 text-sm" onClick={e => e.stopPropagation()}>
        <span className="truncate max-w-[50vw]">{attachment.name}</span>
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-white/10 hover:bg-white/20 transition-colors duration-150 text-white font-medium"
        >
          <Download size={14} aria-hidden="true" /> Open
        </a>
      </div>
    </div>
  )
}

interface AttachmentGalleryProps {
  attachments: MessageAttachment[]
  isMine: boolean
}

/** Images render edge-to-edge (iMessage style); other files render as chips. */
export function AttachmentGallery({ attachments, isMine }: AttachmentGalleryProps) {
  const [lightbox, setLightbox] = useState<MessageAttachment | null>(null)
  const images = attachments.filter(isImage)
  const files = attachments.filter(a => !isImage(a))

  return (
    <>
      {images.length === 1 && (
        <button
          onClick={() => setLightbox(images[0])}
          className="block max-w-[280px] rounded-2xl overflow-hidden border border-black/[0.06] transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harmonic-primary"
          aria-label={`View image ${images[0].name}`}
        >
          <img
            src={images[0].url}
            alt={images[0].name}
            loading="lazy"
            className="w-full h-auto max-h-[320px] object-cover"
            style={
              images[0].width && images[0].height
                ? { aspectRatio: `${images[0].width} / ${images[0].height}` }
                : undefined
            }
          />
        </button>
      )}

      {images.length > 1 && (
        <div className="grid grid-cols-2 gap-1 max-w-[280px] rounded-2xl overflow-hidden">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightbox(img)}
              className="aspect-square overflow-hidden transition-transform duration-200 ease-out hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harmonic-primary"
              aria-label={`View image ${img.name}`}
            >
              <img src={img.url} alt={img.name} loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {files.map((file, i) => (
        <a
          key={i}
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2.5 rounded-xl max-w-[280px] transition-all duration-200 ease-out hover:scale-[1.01] active:scale-[0.99]',
            isMine
              ? 'bg-white/15 text-white hover:bg-white/25'
              : 'bg-white border border-black/[0.06] text-harmonic-text hover:bg-harmonic-surface',
          )}
        >
          <span
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0',
              isMine ? 'bg-white/20' : 'bg-harmonic-primary/10',
            )}
          >
            <FileText size={18} aria-hidden="true" className={isMine ? 'text-white' : 'text-harmonic-primary'} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium truncate">{file.name}</span>
            <span className={cn('block text-[11px]', isMine ? 'text-white/70' : 'text-harmonic-muted')}>
              {formatBytes(file.size)}
            </span>
          </span>
        </a>
      ))}

      {lightbox && <Lightbox attachment={lightbox} onClose={() => setLightbox(null)} />}
    </>
  )
}
