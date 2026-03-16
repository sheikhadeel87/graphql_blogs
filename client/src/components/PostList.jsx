import PostCard from './PostCard'

/**
 * Renders a list of post cards with loading skeleton, empty state, and optional pagination.
 * Used by Home and AuthorPosts.
 */
export default function PostList({
  posts = [],
  loading = false,
  totalPages = 0,
  currentPage = 1,
  onPageChange,
  emptyMessage = 'No posts yet.',
  emptyAction,
  user,
  isLoggedIn,
  showAuthorRow = true,
  linkToAuthor,
  onLikeClick,
  onFollowClick,
  onUnfollowClick,
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse p-6">
            <div className="h-6 w-3/4 rounded-lg bg-surface-200" />
            <div className="mt-3 h-4 w-1/4 rounded bg-surface-100" />
            <div className="mt-4 h-4 w-full rounded bg-surface-100" />
            <div className="mt-2 h-4 w-2/3 rounded bg-surface-100" />
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <p className="text-surface-500">{emptyMessage}</p>
        {emptyAction}
      </div>
    )
  }

  return (
    <>
      <ul className="space-y-5">
        {posts.map((post, i) => (
          <PostCard
            key={post.id}
            post={post}
            user={user}
            isLoggedIn={isLoggedIn}
            showAuthorRow={showAuthorRow}
            linkToAuthor={typeof linkToAuthor === 'function' ? linkToAuthor(post) : !!linkToAuthor}
            onLikeClick={onLikeClick}
            onFollowClick={onFollowClick}
            onUnfollowClick={onUnfollowClick}
            index={i}
          />
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            className="btn-secondary"
          >
            Previous
          </button>
          <span className="text-sm text-surface-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </>
  )
}
