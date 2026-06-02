import { Music2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlbumArtProps {
  src?: string | null
  alt: string
  className?: string
  iconSize?: number
}

/** Album artwork with lazy loading and a gradient fallback. */
export function AlbumArt({ src, alt, className, iconSize = 22 }: AlbumArtProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn('object-cover', className)}
      />
    )
  }
  return (
    <div
      className={cn('flex items-center justify-center', 'bg-featured-song-gradient', className)}
      aria-hidden="true"
    >
      <Music2 size={iconSize} className="text-white/80" />
    </div>
  )
}
