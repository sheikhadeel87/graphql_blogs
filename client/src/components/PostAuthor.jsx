import { Link } from 'react-router-dom'

/**
 * Displays a user's avatar (circular) next to their name.
 * When author has an id, name/avatar link to that author's posts page.
 * Use with author row outside any parent Link (e.g. on Home) so there is no <a> inside <a>.
 */
export default function PostAuthor({ author, size = 'md', className = '', linkToAuthor = true }) {
  const name = author?.name ?? 'Unknown'
  const avatarUrl = author?.avatar ?? null
  const authorId = author?.id ?? null
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

  const content = (
    <>
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-surface-200 dark:bg-surface-600 text-surface-600 dark:text-surface-100 font-medium overflow-hidden ${s}`}
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
    </>
  )

  const wrapperClass = `inline-flex items-center gap-2 ${className}`

  if (linkToAuthor && authorId) {
    return (
      <Link
        to={`/author/${authorId}`}
        className={`${wrapperClass} hover:text-accent-500 hover:underline underline-offset-2`}
      >
        {content}
      </Link>
    )
  }

  return <span className={wrapperClass}>{content}</span>
}
