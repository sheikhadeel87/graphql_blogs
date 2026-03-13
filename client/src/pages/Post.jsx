import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { GET_POST } from '../graphql/queries'
import { CREATE_COMMENT, LIKE_POST, UNLIKE_POST } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'
import { useState, useRef, useEffect } from 'react'
import { formatPostDate } from '../lib/dateUtils'
import ErrorAlert from '../components/ErrorAlert'
import LikeButton from '../components/LikeButton'
import PostAuthor from '../components/PostAuthor'
import EmojiPicker from 'emoji-picker-react'

export default function Post() {
  const { id } = useParams()
  const { user, isLoggedIn } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false)
      }
    }
    if (showEmojiPicker) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmojiPicker])

  const { data, loading, error } = useQuery(GET_POST, { variables: { id } })
  const [addComment, { loading: submitting }] = useMutation(CREATE_COMMENT, {
    refetchQueries: [{ query: GET_POST, variables: { id } }],
  })
  const [likePost] = useMutation(LIKE_POST, {
    refetchQueries: [{ query: GET_POST, variables: { id } }],
  })
  const [unlikePost] = useMutation(UNLIKE_POST, {
    refetchQueries: [{ query: GET_POST, variables: { id } }],
  })

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    try {
      await addComment({
        variables: { text: commentText.trim(), postId: id, userId: user?.id ?? null },
      })
      setCommentText('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleLikeClick = () => {
    if (!isLoggedIn) return
    const liked = data?.post?.likedBy?.some((u) => u.id === user?.id)
    if (liked) unlikePost({ variables: { postId: id } }).catch(console.error)
    else likePost({ variables: { postId: id } }).catch(console.error)
  }

  const handleEmojiClick = (emojiData) => {
    setCommentText((prev) => prev + emojiData.emoji)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 w-24 rounded bg-surface-200" />
        <div className="mt-6 h-10 w-3/4 rounded-lg bg-surface-200" />
        <div className="mt-3 h-5 w-1/4 rounded bg-surface-100" />
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full rounded bg-surface-100" />
          <div className="h-4 w-2/3 rounded bg-surface-100" />
        </div>
      </div>
    )
  }

  if (error) return <ErrorAlert message={error.message} />
  if (!data?.post) {
    return (
      <div className="card p-8 text-center">
        <p className="text-surface-500">Post not found.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Back to posts</Link>
      </div>
    )
  }

  const post = data.post

  return (
    <article className="animate-fade-in single-post-page" data-post-id={post.id}>
      <Link to="/" className="mb-6 inline-flex items-center text-sm font-medium text-surface-500 hover:text-accent-500">
        ← Back to posts
      </Link>

      <header className="mb-8">
        <h1 className="heading-display text-3xl text-surface-900 sm:text-4xl md:text-[2.5rem]">{post.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-surface-500">
          <PostAuthor author={post.author} size="md" />
          {(post.publishedAt || post.createdAt) && (
            <>
              <span className="text-surface-300">·</span>
              <time dateTime={post.publishedAt || post.createdAt} className="text-sm">
                {formatPostDate(post.publishedAt || post.createdAt)}
              </time>
            </>
          )}
          <span className="text-surface-300">·</span>
          <span>{post.likes ?? 0} like{(post.likes ?? 0) !== 1 ? 's' : ''}</span>
          {post.viewCount != null && post.viewCount > 0 && (
            <>
              <span className="text-surface-300">·</span>
              <span>{post.viewCount} view{post.viewCount !== 1 ? 's' : ''}</span>
            </>
          )}
          {isLoggedIn && (
            <>
              <span className="text-surface-300">·</span>
              <LikeButton
                liked={post.likedBy?.some((u) => u.id === user?.id)}
                onClick={handleLikeClick}
              />
            </>
          )}
        </p>
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-accent-600">
            {post.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </p>
        )}
      </header>

      {post.coverImage && (
        <figure className="mb-8 -mx-4 sm:mx-0 overflow-hidden bg-surface-100 p-[0px]">
          <img src={post.coverImage} alt="" className="w-full aspect-[2/1] object-cover rounded-xl" />
        </figure>
      )}

      {/* <div className="font-display max-w-none text-surface-700 whitespace-pre-wrap leading-relaxed text-[15px] sm:text-[17px]">
        {post.content}
      </div> */}
      <div
        className="font-display max-w-none text-surface-700 leading-relaxed text-[15px] sm:text-[17px] prose prose-headings:font-display prose-p:my-2 prose-ul:my-2 prose-ol:my-2"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />

      <section className="mt-12 border-t border-surface-200 pt-10">
        <h2 className="font-display text-lg font-semibold text-surface-900">Comments ({post.comments?.length ?? 0})</h2>

        {isLoggedIn && (
          <form onSubmit={handleSubmitComment} className="mt-6">
            <div className="relative" ref={emojiPickerRef}>
              <div className="relative rounded-xl border border-surface-200 bg-white shadow-sm focus-within:border-accent-400 focus-within:ring-1 focus-within:ring-accent-500/30">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="block w-full resize-none rounded-xl border-0 bg-transparent py-3 pl-4 pr-12 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((open) => !open)}
                  className="absolute right-2 bottom-2 rounded-lg p-1.5 text-surface-400 bg-[aliceblue] hover:bg-surface-300 hover:text-surface-600 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                  title="Add emoji"
                  aria-label="Add emoji"
                >
                  <span className="text-lg leading-none" role="img" aria-hidden>😊</span>
                </button>
              </div>
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-1 z-10 drop-shadow-lg">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>
            <button type="submit" disabled={submitting || !commentText.trim()} className="btn-primary mt-3">
              {submitting ? 'Sending...' : 'Add comment'}
            </button>
          </form>
        )}

        <ul className="mt-6 space-y-4">
          {(post.comments ?? []).map((c) => (
            <li key={c.id} className="card p-4 pl-5 border-l-4 border-l-accent-500">
              <p className="font-display text-surface-700 leading-relaxed">{c.text}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-surface-500">
                <PostAuthor author={c.author} size="sm" />
                {c.createdAt && (
                  <>
                    <span className="text-surface-300">·</span>
                    <time dateTime={c.createdAt}>{formatPostDate(c.createdAt)}</time>
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
