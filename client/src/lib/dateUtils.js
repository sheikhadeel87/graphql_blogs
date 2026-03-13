/**
 * Format ISO date string for display.
 * - Recent (< 24h): "2 hours ago"
 * - Same year: "Mar 6 at 2:30 PM"
 * - Other: "Mar 6, 2025 at 2:30 PM"
 */
export function formatPostDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffHours < 1) {
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)))
    return `${mins} min ago`
  }
  if (diffHours < 24) {
    const hours = Math.floor(diffHours)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  if (diffDays < 7) {
    const days = Math.floor(diffDays)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const sameYear = date.getFullYear() === now.getFullYear()
  const dateStr = sameYear
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${dateStr} at ${timeStr}`
}

/**
 * Shorter format for list views: "Mar 6, 2026" or "2 days ago"
 */
export function formatPostDateShort(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffDays = (now - date) / (1000 * 60 * 60 * 24)

  if (diffDays < 1) {
    const hours = Math.floor(diffDays * 24)
    if (hours < 1) {
      const mins = Math.max(1, Math.floor(diffDays * 24 * 60))
      return `${mins}m ago`
    }
    return `${hours}h ago`
  }
  if (diffDays < 7) return `${Math.floor(diffDays)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}
