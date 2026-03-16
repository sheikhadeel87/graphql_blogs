import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { GET_POSTS_PAGINATED, GET_USER } from '../graphql/queries'
import { LIKE_POST, UNLIKE_POST, FOLLOW_USER, UNFOLLOW_USER } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'
import ErrorAlert from '../components/ErrorAlert'
import PostAuthor from '../components/PostAuthor'
import PostList from '../components/PostList'

export default function AuthorPosts() {
  const { userId } = useParams()
  const { user, isLoggedIn } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 10

  const { data: userData, loading: loadingUser } = useQuery(GET_USER, {
    variables: { id: userId },
    skip: !userId,
  })
  const author = userData?.user
  const isFollowing = author?.followers?.some((f) => f.id === user?.id) ?? false
  const isOwnProfile = userId === user?.id
  const canViewPosts = isOwnProfile || (isLoggedIn && isFollowing)

  const filter = { authorId: userId, status: 'published' }
  const { data, loading, error } = useQuery(GET_POSTS_PAGINATED, {
    variables: { filter, page: currentPage, limit },
    skip: !userId || (author != null && !canViewPosts),
  })
  const [likePost] = useMutation(LIKE_POST, {
    refetchQueries: [{ query: GET_POSTS_PAGINATED, variables: { filter, page: currentPage, limit } }],
  })
  const [unlikePost] = useMutation(UNLIKE_POST, {
    refetchQueries: [{ query: GET_POSTS_PAGINATED, variables: { filter, page: currentPage, limit } }],
  })
  const [followUser] = useMutation(FOLLOW_USER, {
    refetchQueries: [{ query: GET_USER, variables: { id: userId } }, { query: GET_POSTS_PAGINATED, variables: { filter, page: currentPage, limit } }],
  })
  const [unfollowUser] = useMutation(UNFOLLOW_USER, {
    refetchQueries: [{ query: GET_USER, variables: { id: userId } }, { query: GET_POSTS_PAGINATED, variables: { filter, page: currentPage, limit } }],
  })

  const pagination = data?.posts
  const list = pagination?.posts ?? []
  const totalPages = pagination?.totalPages ?? 0
  const current = pagination?.currentPage ?? 1
  const totalPosts = pagination?.totalPosts ?? 0

  const handleLikeClick = (e, post) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) return
    const liked = post.likedBy?.some((u) => u.id === user?.id)
    if (liked) unlikePost({ variables: { postId: post.id } }).catch(console.error)
    else likePost({ variables: { postId: post.id } }).catch(console.error)
  }

  const handleFollow = () => {
    if (!userId || !isLoggedIn || userId === user?.id) return
    followUser({ variables: { userId } }).catch(console.error)
  }
  const handleUnfollow = () => {
    if (!userId || !isLoggedIn || userId === user?.id) return
    unfollowUser({ variables: { userId } }).catch(console.error)
  }

  if (!userId) {
    return (
      <div className="card p-8 text-center">
        <p className="text-surface-500">Invalid author.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Back to posts</Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Link to="/" className="mb-6 inline-flex items-center text-sm font-medium text-surface-500 hover:text-accent-500">
        ← Back to posts
      </Link>

      {author && (
        <header className="card p-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <PostAuthor author={author} size="lg" linkToAuthor={false} />
            <div>
              <h1 className="heading-display text-2xl text-surface-900">{author.name}&apos;s posts</h1>
              <p className="mt-1 text-surface-500">
                {canViewPosts ? (loading ? '...' : `${totalPosts} post${totalPosts === 1 ? '' : 's'}`) : 'Follow to see their posts'}
              </p>
            </div>
          </div>
          {isLoggedIn && !isOwnProfile && (
            isFollowing ? (
              <button type="button" onClick={handleUnfollow} className="btn-secondary self-start sm:self-center">
                Unfollow
              </button>
            ) : (
              <button type="button" onClick={handleFollow} className="btn-primary self-start sm:self-center">
                Follow
              </button>
            )
          )}
        </header>
      )}

      {!loadingUser && !author && (
        <div className="card p-8 text-center">
          <p className="text-surface-500">Author not found.</p>
          <Link to="/" className="btn-primary mt-4 inline-flex">Back to posts</Link>
        </div>
      )}

      {error && (
        <ErrorAlert
          message={
            error.graphQLErrors?.[0]?.message ||
            error.networkError?.result?.errors?.[0]?.message ||
            error.message
          }
        />
      )}

      {author && !canViewPosts && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-surface-600">
            Follow <strong>{author.name}</strong> to see their posts.
          </p>
          {isLoggedIn ? (
            <button type="button" onClick={handleFollow} className="btn-primary mt-4">
              Follow {author.name}
            </button>
          ) : (
            <p className="mt-4 text-sm text-surface-500">
              <Link to="/login" className="font-medium text-accent-600 hover:underline">Log in</Link> to follow and view their posts.
            </p>
          )}
        </div>
      )}

      {author && canViewPosts && (
        <PostList
          posts={list}
          loading={loading}
          totalPages={totalPages}
          currentPage={current}
          onPageChange={setCurrentPage}
          emptyMessage="No posts yet."
          emptyAction={<Link to="/" className="btn-primary mt-4">Browse all posts</Link>}
          user={user}
          isLoggedIn={isLoggedIn}
          showAuthorRow={false}
          linkToAuthor={false}
          onLikeClick={handleLikeClick}
        />
      )}
    </div>
  )
}
