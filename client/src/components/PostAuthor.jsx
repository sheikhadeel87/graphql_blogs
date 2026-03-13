/**
 * Displays a user's avatar (circular) next to their name.
 * Fallback: initials when no avatar URL.
 */
export default function PostAuthor({ author, size = 'md', className = '' }) {
  const name = author?.name ?? 'Unknown'
  const avatarUrl = author?.avatar ?? null
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }
  const s = sizeClasses[size] ?? sizeClasses.md

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-surface-200 text-surface-600 font-medium overflow-hidden ${s}`}
        aria-hidden
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </span>
      <span className="text-surface-500 font-medium">{name}</span>
    </span>
  )
}
