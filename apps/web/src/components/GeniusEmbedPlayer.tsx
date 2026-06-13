import { useEffect, useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'

interface GeniusEmbedPlayerProps {
  songId: number
  geniusUrl: string
  title: string
}

/**
 * Renders the official Genius lyrics embed widget.
 *
 * Genius's embed.js uses `document.write()`. Injecting it directly into the
 * page would blank the entire SPA, because a dynamically-added script runs
 * after load, and `document.write()` on an already-closed document replaces
 * the whole document. We therefore mount the standard Genius snippet inside an
 * iframe via `srcDoc`: the `<script>` is parser-inserted, so its
 * `document.write()` runs synchronously during the iframe's own parse (works
 * correctly) and is fully contained to the iframe document (can never touch
 * the host page). The iframe is same-origin (srcDoc, no sandbox) so we can read
 * its content height and grow the frame to fit the lyrics.
 */
export function GeniusEmbedPlayer({ songId, geniusUrl, title }: GeniusEmbedPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(420)

  // Escape values that land inside the HTML document.
  const safeUrl = geniusUrl.replace(/"/g, '&quot;')
  const safeTitle = title.replace(/[<>&"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] ?? c),
  )

  const srcDoc =
    `<!doctype html><html><head><meta charset="utf-8">` +
    `<base target="_blank">` +
    `<style>html,body{margin:0;padding:0;background:transparent;` +
    `font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif}` +
    `.rg_embed_link{font-size:13px}</style></head><body>` +
    `<div id="rg_embed_link_${songId}" class="rg_embed_link" data-song-id="${songId}">` +
    `<a href="${safeUrl}">Read &ldquo;${safeTitle}&rdquo; on Genius</a></div>` +
    `<script crossorigin src="https://genius.com/songs/${songId}/embed.js"></script>` +
    `</body></html>`

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    let cancelled = false

    // The Genius widget injects a nested iframe whose height settles a moment
    // after load. Poll the (same-origin) srcDoc body height and grow to fit.
    const measure = () => {
      if (cancelled) return
      try {
        const body = iframe.contentDocument?.body
        const h = body ? body.scrollHeight : 0
        if (h > 0) setHeight((prev) => (Math.abs(prev - h) > 4 ? h : prev))
      } catch {
        /* cross-origin read blocked — keep the default height */
      }
    }

    const poll = window.setInterval(measure, 400)
    const stop = window.setTimeout(() => window.clearInterval(poll), 8000)
    return () => {
      cancelled = true
      window.clearInterval(poll)
      window.clearTimeout(stop)
    }
  }, [songId])

  return (
    <div>
      <iframe
        ref={iframeRef}
        title={`Lyrics for ${title} on Genius`}
        srcDoc={srcDoc}
        loading="lazy"
        className="w-full rounded-2xl"
        style={{ height, border: 0 }}
      />
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
