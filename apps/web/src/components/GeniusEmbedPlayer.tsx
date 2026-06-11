import { useEffect, useRef } from 'react'
import { ExternalLink } from 'lucide-react'

interface GeniusEmbedPlayerProps {
  songId: number
  geniusUrl: string
  title: string
}

/**
 * Renders the official Genius lyrics embed widget by injecting their
 * embed script into the DOM. The script replaces the anchor tag in-place
 * with the fully styled lyrics widget (no iframe).
 */
export function GeniusEmbedPlayer({ songId, geniusUrl, title }: GeniusEmbedPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    // Genius embed requires a div with these attributes as the mount point
    const mountDiv = document.createElement('div')
    mountDiv.id = `rg_embed_link_${songId}`
    mountDiv.className = 'rg_embed_link'
    mountDiv.dataset.songId = String(songId)
    const anchor = document.createElement('a')
    anchor.href = geniusUrl
    anchor.textContent = `Read "${title}" on Genius`
    mountDiv.appendChild(anchor)
    container.appendChild(mountDiv)

    // Genius embed script — replaces the div above with the widget
    const script = document.createElement('script')
    script.src = `https://genius.com/songs/${songId}/embed.js`
    script.crossOrigin = 'anonymous'
    container.appendChild(script)

    return () => {
      container.innerHTML = ''
    }
  }, [songId, geniusUrl, title])

  return (
    <div>
      <div ref={containerRef} className="min-h-[240px]" />
      <a
        href={geniusUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-harmonic-muted hover:text-harmonic-primary transition-colors mt-3"
      >
        <ExternalLink size={11} aria-hidden="true" />
        View on Genius
      </a>
    </div>
  )
}
