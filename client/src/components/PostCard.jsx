import { Link } from 'react-router-dom'
import { formatPostDateShort } from '../lib/dateUtils'
import { stripHtml } from '../lib/textUtils'
import PostAuthor from './PostAuthor'
import LikeButton from './LikeButton'

/**
 * Single post card for list views. Used by PostList on Home and AuthorPosts.
 * @param {Object} post - Post data
 * @param {Object} user - Current user
 * @param {boolean} isLoggedIn
 * @param {boolean} showAuthorRow - When true (Home), show author + Follow/Unfollow above the post link
 * @param {boolean} linkToAuthor - When true, author name links to author page
 * @param {Function} onLikeClick - (e, post) => void
 * @param {Function} onFollowClick - (e, authorId) => void
 * @param {Function} onUnfollowClick - (e, authorId) => void
 * @param {number} index - For animation delay
 */
export default function PostCard({
  post,
  user,
  isLoggedIn,
  showAuthorRow = true,
  linkToAuthor = false,
  onLikeClick,
  onFollowClick,
  onUnfollowClick,
  index = 0,
}) {
  const liked = post.likedBy?.some((u) => u.id === user?.id)
  const likeCount = post.likes ?? 0
  const isOwnAuthor = post.author?.id === user?.id
  const isFollowing = post.author?.followers?.some((f) => f.id === user?.id)

  const metaLine = (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-surface-500">
      <span>{post.comments?.length ?? 0} comments</span>
      <span className="text-surface-300">·</span>
      <span>{likeCount} like{likeCount !== 1 ? 's' : ''}</span>
      {post.viewCount != null && post.viewCount > 0 && (
        <>
          <span className="text-surface-300">·</span>
          <span>{post.viewCount} view{post.viewCount !== 1 ? 's' : ''}</span>
        </>
      )}
      {(post.publishedAt || post.createdAt) && (
        <>
          <span className="text-surface-300">·</span>
          <time dateTime={post.publishedAt || post.createdAt}>
            {formatPostDateShort(post.publishedAt || post.createdAt)}
          </time>
        </>
      )}
    </p>
  )

  const titleExcerptBlock = (
    <>
      <h2 className="font-display text-xl font-semibold text-surface-900 hover:text-accent-500 line-clamp-2 mt-2">
        {post.title}
      </h2>
      <p className="font-display mt-3 text-surface-600 line-clamp-2 text-[15px] leading-relaxed">
        {stripHtml(post.content)}
      </p>
      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-accent-600">
          {post.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center text-sm font-semibold text-accent-500">Read more →</span>
        {isLoggedIn && (
          <LikeButton liked={liked} onClick={(e) => onLikeClick?.(e, post)} count={likeCount} />
        )}
      </div>
    </>
  )

  const coverBlock = post.coverImage && (
    <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-56 md:w-64 overflow-hidden bg-white p-[5px]">
      <img src={post.coverImage} alt="" className="h-full w-full object-cover rounded-[6px]" />
    </div>
  )

  if (showAuthorRow) {
    return (
      <li className="animate-slide-up card-hover overflow-hidden" style={{ animationDelay: `${index * 50}ms` }}>
        <div className="flex flex-col sm:flex-row">
          <div className="min-w-0 flex-1 p-6 sm:p-7">
            <p className="mt-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-surface-500">
              <PostAuthor author={post.author} size="md" linkToAuthor={linkToAuthor} />
              {isLoggedIn && post.author && !isOwnAuthor && (
                <>
                  <span className="text-surface-300">·</span>
                  {isFollowing ? (
                    <button
                      type="button"
                      onClick={(e) => onUnfollowClick?.(e, post.author.id)}
                      className="text-sm font-medium text-surface-600 hover:text-surface-900 underline"
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => onFollowClick?.(e, post.author.id)}
                      className="text-sm font-medium text-accent-600 hover:text-accent-700 underline"
                    >
                      Follow
                    </button>
                  )}
                </>
              )}
              <span className="text-surface-300">·</span>
              <span>{post.comments?.length ?? 0} comments</span>
              <span className="text-surface-300">·</span>
              <span>{likeCount} like{likeCount !== 1 ? 's' : ''}</span>
              {post.viewCount != null && post.viewCount > 0 && (
                <>
                  <span className="text-surface-300">·</span>
                  <span>{post.viewCount} view{post.viewCount !== 1 ? 's' : ''}</span>
                </>
              )}
              {post.publishedAt ? (
                <>
                  <span className="text-surface-300">·</span>
                  <time dateTime={post.publishedAt}>{formatPostDateShort(post.publishedAt)}</time>
                </>
              ) : post.createdAt ? (
                <>
                  <span className="text-surface-300">·</span>
                  <time dateTime={post.createdAt}>{formatPostDateShort(post.createdAt)}</time>
                </>
              ) : null}
            </p>
            <Link to={`/post/${post.id}`} className="block">
              {titleExcerptBlock}
            </Link>
          </div>
          {post.coverImage && (
            <Link
              to={`/post/${post.id}`}
              className="relative h-40 w-full shrink-0 sm:h-auto sm:w-56 md:w-64 overflow-hidden bg-white p-[5px] block"
            >
              <img src={post.coverImage} alt="" className="h-full w-full object-cover rounded-[6px]" />
            </Link>
          )}
        </div>
      </li>
    )
  }

  return (
    <li className="card-hover card overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
      <Link to={`/post/${post.id}`} className="flex flex-col sm:flex-row">
        <div className="min-w-0 flex-1 p-6 sm:p-7">
          <h2 className="font-display text-xl font-semibold text-surface-900 hover:text-accent-500 line-clamp-2">
            {post.title}
          </h2>
          {metaLine}
          <p className="font-display mt-3 text-surface-600 line-clamp-2 text-[15px] leading-relaxed">
            {stripHtml(post.content)}
          </p>
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-accent-600">
              {post.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center text-sm font-semibold text-accent-500">Read more →</span>
            {isLoggedIn && (
              <LikeButton liked={liked} onClick={(e) => onLikeClick?.(e, post)} count={likeCount} />
            )}
          </div>
        </div>
        {coverBlock}
      </Link>
    </li>
  )
}
