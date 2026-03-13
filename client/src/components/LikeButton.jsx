/**
 * Elegant like/unlike button with heart icon.
 * Liked: soft pink background, filled red heart.
 * Default: neutral background, outline heart.
 */
export default function LikeButton({ liked, onClick, count, disabled, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike' : 'Like'}
      className={`
        like-btn inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium
        transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-60 disabled:cursor-not-allowed select-none
        ${liked
          ? 'like-btn--liked bg-[#fce7e8] text-[#c73b3c] hover:bg-[#fad4d6] focus:ring-[#c73b3c]/30'
          : 'like-btn--default bg-surface-100/80 text-surface-500 hover:bg-surface-200/80 hover:text-surface-700 focus:ring-surface-300/50'
        }
        ${className}
      `}
    >
      <span className="like-btn__icon flex items-center justify-center w-4 h-4 shrink-0" aria-hidden>
        {liked ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        )}
      </span>
      <span className="like-btn__label">{liked ? 'Liked' : 'Like'}</span>
      {/* {count != null && (
        <span className={liked ? 'text-[#c73b3c]/90' : 'text-surface-400'}>{count}</span>
      )} */}
    </button>
  )
}
