import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Link } from 'react-router-dom'
import { GET_POSTS_PAGINATED } from '../graphql/queries'
import { LIKE_POST, UNLIKE_POST } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'
import { formatPostDateShort } from '../lib/dateUtils'
import ErrorAlert from '../components/ErrorAlert'
import LikeButton from '../components/LikeButton'
import PostAuthor from '../components/PostAuthor'
import SearchFilterPanel from '../components/SearchFilterPanel'

const emptyFilter = {}

function toQueryFilter(f) {
  if (!f || Object.keys(f).every((k) => !f[k])) return emptyFilter
  const out = {}
  if (f.title) out.title = f.title
  if (f.authorName) out.authorName = f.authorName
  if (f.tag) out.tag = f.tag
  if (f.status != null && f.status !== '') out.status = f.status
  if (f.startDate) out.startDate = f.startDate
  if (f.endDate) out.endDate = f.endDate
  if (f.sortBy) out.sortBy = f.sortBy
  return out
}

function stripHtml(html) {
  if (!html || typeof html !== 'string') return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState(emptyFilter)
  const limit = 5
  const queryFilter = toQueryFilter(filter)
  const filterForQuery = queryFilter
  const { user, isLoggedIn } = useAuth()
  const { data, loading, error } = useQuery(GET_POSTS_PAGINATED, {
    variables: { filter: filterForQuery, page: currentPage, limit },
  })
  const [likePost] = useMutation(LIKE_POST, {
    refetchQueries: [{ query: GET_POSTS_PAGINATED, variables: { filter: filterForQuery, page: currentPage, limit } }],
  })
  const [unlikePost] = useMutation(UNLIKE_POST, {
    refetchQueries: [{ query: GET_POSTS_PAGINATED, variables: { filter: filterForQuery, page: currentPage, limit } }],
  })
  const pagination = data?.posts
  const list = pagination?.posts ?? []
  const totalPages = pagination?.totalPages ?? 0
  const current = pagination?.currentPage ?? 1

  const handleLikeClick = (e, post) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) return
    const liked = post.likedBy?.some((u) => u.id === user?.id)
    if (liked) unlikePost({ variables: { postId: post.id } }).catch(console.error)
    else likePost({ variables: { postId: post.id } }).catch(console.error)
  }

  const handleApplyFilter = (newFilter) => {
    setFilter(newFilter)
    setCurrentPage(1)
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="heading-display text-3xl text-surface-900 sm:text-4xl md:text-[2.75rem]">Latest posts</h1>
        <p className="mt-2 text-surface-500">
          {loading ? 'Loading...' : list.length === 0 ? 'No posts yet.' : `${pagination?.totalPosts ?? list.length} post${(pagination?.totalPosts ?? list.length) === 1 ? '' : 's'}`}
        </p>
        <p className="mt-1 text-sm text-surface-400">Search by keyword, author, tag, or date range using the filter panel.</p>
      </header>

      <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start">
        <main className="min-w-0 flex-1">
          {error && <ErrorAlert message={error.message} />}

          {loading ? (
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
          ) : list.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <p className="text-surface-500">No posts yet. Be the first to write one.</p>
              <Link to="/register" className="btn-primary mt-4">Sign up to post</Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {list.map((post, i) => {
                const liked = post.likedBy?.some((u) => u.id === user?.id)
                const likeCount = post.likes ?? 0
                return (
                  <li key={post.id} className="animate-slide-up card-hover overflow-hidden" style={{ animationDelay: `${i * 50}ms` }}>
                    <Link to={`/post/${post.id}`} className="flex flex-col sm:flex-row">
                      <div className="min-w-0 flex-1 p-6 sm:p-7">
                        <h2 className="font-display text-xl font-semibold text-surface-900 hover:text-accent-500 line-clamp-2">{post.title}</h2>
                        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-surface-500">
                          <PostAuthor author={post.author} size="md" />
                          <span className="text-surface-300">·</span>
                          <span>{post.comments?.length ?? 0} comments</span>
                          <span className="text-surface-300">·</span>
                          <span>{likeCount} like{likeCount !== 1 ? 's' : ''}</span>
                          {(post.viewCount != null && post.viewCount > 0) && (
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
                        {/* <p className="font-display mt-3 text-surface-600 line-clamp-2 text-[15px] leading-relaxed">{post.content}</p> */}
                        <p className="font-display mt-3 text-surface-600 line-clamp-2 text-[15px] leading-relaxed">{stripHtml(post.content)}</p>
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
                            <LikeButton
                              liked={liked}
                              onClick={(e) => handleLikeClick(e, post)}
                              count={likeCount}
                            />
                          )}
                        </div>
                      </div>
                      {post.coverImage && (
                        <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-56 md:w-64 overflow-hidden bg-white p-[5px]">
                          <img src={post.coverImage} alt="" className="h-full w-full object-cover rounded-[6px]" />
                        </div>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          {!loading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={current <= 1}
                className="btn-secondary"
              >
                Previous
              </button>
              <span className="text-sm text-surface-600">
                Page {current} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={current >= totalPages}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </main>

        <aside className="w-full lg:w-72 shrink-0 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto">
          <SearchFilterPanel filter={filter} onApply={handleApplyFilter} />
        </aside>
      </div>
    </div>
  )
}
