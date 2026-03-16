import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Link } from 'react-router-dom'
import { GET_POSTS_PAGINATED } from '../graphql/queries'
import { LIKE_POST, UNLIKE_POST, FOLLOW_USER, UNFOLLOW_USER } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'
import ErrorAlert from '../components/ErrorAlert'
import PostList from '../components/PostList'
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
  const [followUser] = useMutation(FOLLOW_USER, {
    refetchQueries: [{ query: GET_POSTS_PAGINATED, variables: { filter: filterForQuery, page: currentPage, limit } }],
  })
  const [unfollowUser] = useMutation(UNFOLLOW_USER, {
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

  const handleFollowClick = (e, authorId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn || !authorId || authorId === user?.id) return
    followUser({ variables: { userId: authorId } }).catch(console.error)
  }
  const handleUnfollowClick = (e, authorId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn || !authorId || authorId === user?.id) return
    unfollowUser({ variables: { userId: authorId } }).catch(console.error)
  }

  const getLinkToAuthor = (post) => !!(
    post.author &&
    (post.author.id === user?.id || post.author.followers?.some((f) => f.id === user?.id))
  )

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

          <PostList
            posts={list}
            loading={loading}
            totalPages={totalPages}
            currentPage={current}
            onPageChange={setCurrentPage}
            emptyMessage="No posts yet. Be the first to write one."
            emptyAction={<Link to="/register" className="btn-primary mt-4">Sign up to post</Link>}
            user={user}
            isLoggedIn={isLoggedIn}
            showAuthorRow
            linkToAuthor={getLinkToAuthor}
            onLikeClick={handleLikeClick}
            onFollowClick={handleFollowClick}
            onUnfollowClick={handleUnfollowClick}
          />
        </main>

        <aside className="w-full lg:w-72 shrink-0 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto">
          <SearchFilterPanel filter={filter} onApply={handleApplyFilter} />
        </aside>
      </div>
    </div>
  )
}
