/** Minimal HTML sanitizer for announcement bodies.
 *  Allows only basic formatting tags; strips everything else (incl. scripts,
 *  attributes, event handlers) to prevent XSS when rendering with
 *  dangerouslySetInnerHTML. */
const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'P', 'BR', 'DIV'])

export function sanitizeHtml(html: string): string {
  const template = document.createElement('template')
  template.innerHTML = html

  const walk = (node: Node) => {
    const children = Array.from(node.childNodes)
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        if (!ALLOWED.has(el.tagName)) {
          // unwrap disallowed elements, keeping their text
          el.replaceWith(...Array.from(el.childNodes))
          continue
        }
        // strip all attributes (no styles, no event handlers, no hrefs)
        for (const attr of Array.from(el.attributes)) el.removeAttribute(attr.name)
        walk(el)
      } else if (child.nodeType !== Node.TEXT_NODE) {
        child.remove()
      }
    }
  }

  walk(template.content)
  return template.innerHTML
}

/** Plain-text preview (first N chars) from HTML, for collapsed cards. */
export function htmlToText(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return (tmp.textContent ?? '').trim()
}
