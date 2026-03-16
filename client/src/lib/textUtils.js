/**
 * Strip HTML tags from a string (e.g. for post excerpts).
 */
export function stripHtml(html) {
  if (!html || typeof html !== 'string') return ''
  return html.replace(/<[^>]*>/g, '').trim()
}
