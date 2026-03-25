import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { GET_POSTS, GET_USER } from '../graphql/queries'
import { CREATE_POST, UPDATE_POST, DELETE_POST, ENHANCE_WITH_AI, UPDATE_USER } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'
import { formatPostDateShort } from '../lib/dateUtils'
import { uploadImage } from '../lib/uploadImage'
import FormField from '../components/FormField'
import RichTextEditor from '../components/RichTextEditor'


export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const fileRef = useRef(null)
  const profileAvatarRef = useRef(null)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', coverImage: '', tags: '', status: 'published', slug: '' })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [editorKey, setEditorKey] = useState(0)
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [profileForm, setProfileForm] = useState({ bio: '', avatar: '' })
  const [profileUploading, setProfileUploading] = useState(false)
  const [profileUploadError, setProfileUploadError] = useState(null)


  const { data, loading, refetch } = useQuery(GET_POSTS, {
    variables: { page: 1, limit: 100 },
  })
  const { data: userData, refetch: refetchUser } = useQuery(GET_USER, {
    variables: { id: user?.id },
    skip: !user?.id,
  })
  const profile = userData?.user
  const [createPost] = useMutation(CREATE_POST, { onCompleted: resetAndRefetch })
  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_USER, variables: { id: user?.id } }],
    onCompleted: () => { setShowProfileEdit(false); refetchUser(); },
    onError: (err) => alert(err.message || 'Failed to update profile'),
  })
  const [updatePost] = useMutation(UPDATE_POST, { onCompleted: () => { setEditingId(null); resetAndRefetch() } })
  const [deletePost] = useMutation(DELETE_POST, { onCompleted: refetch })
  const [enhanceWithAI, { loading: enhancing }] = useMutation(ENHANCE_WITH_AI, {
    onError: (err) => { alert(err.message || 'Failed to enhance with AI') },
  })

function resetAndRefetch() {
  setShowForm(false)
  setForm({ title: '', content: '', coverImage: '', tags: '', status: 'published', slug: '' })
  setUploadError(null)
  refetch()
}

useEffect(() => {
  if (!isLoggedIn) navigate('/login')
}, [isLoggedIn, navigate])

useEffect(() => {
  if (showProfileEdit && profile) {
    setProfileForm({ bio: profile.bio ?? '', avatar: profile.avatar ?? '' })
    setProfileUploadError(null)
  }
}, [showProfileEdit, profile])

const setProfileFormField = (key) => (e) => setProfileForm((f) => ({ ...f, [key]: e.target.value }))

const handleProfileAvatarChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  setProfileUploadError(null)
  setProfileUploading(true)
  try {
    const url = await uploadImage(file)
    setProfileForm((f) => ({ ...f, avatar: url }))
  } catch (err) {
    setProfileUploadError(err.message)
  } finally {
    setProfileUploading(false)
    if (profileAvatarRef.current) profileAvatarRef.current.value = ''
  }
}

const handleProfileSubmit = async (e) => {
  e.preventDefault()
  if (!user?.id) return
  const bio = profileForm.bio.trim() || null
  const avatar = profileForm.avatar.trim() || null
  try {
    await updateUser({ variables: { id: user.id, bio, avatar } })
  } catch (_) {
    // onError shows alert
  }
}

const myPosts = (data?.posts?.posts ?? []).filter((p) => p.author?.id === user?.id)
const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

const handleSubmit = async (e) => {
  e.preventDefault()
  const { title, content, coverImage, tags, status, slug } = form
  if (!title.trim() || !content.trim()) return
  const tagList = tags.trim() ? tags.split(/[\s,]+/).map((t) => t.trim()).filter(Boolean) : []
  const vars = {
    title: title.trim(),
    content: content.trim(),
    coverImage: coverImage.trim() || null,
    tags: tagList,
    status: status || 'draft',
    publishedAt: status === 'published' ? new Date().toISOString() : null,
  }
  if (slug.trim()) vars.slug = slug.trim()
  try {
    if (editingId) await updatePost({ variables: { id: editingId, ...vars } })
    else await createPost({ variables: { ...vars, userId: user.id } })
  } catch (err) {
    console.error(err)
  }
}

const handleFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  setUploadError(null)
  setUploading(true)
  try {
    const url = await uploadImage(file)
    setForm((f) => ({ ...f, coverImage: url }))
  } catch (err) {
    setUploadError(err.message)
  } finally {
    setUploading(false)
    e.target.value = ''
  }
}

const clearCover = () => {
  setForm((f) => ({ ...f, coverImage: '' }))
  setUploadError(null)
  if (fileRef.current) fileRef.current.value = ''
}

const startEdit = (post) => {
  setEditingId(post.id)
  setForm({
    title: post.title,
    content: post.content,
    coverImage: post.coverImage ?? '',
    tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
    status: post.status === 'published' ? 'published' : 'draft',
    slug: post.slug ?? '',
  })
  setUploadError(null)
}

const handleEnhanceContent = async () => {
  console.log('handleEnhanceContent')
  const content = form.content?.replace(/<[^>]+>/g, '').trim() || ''
  if (!content) {
    alert('Write something in the content first.')
    return
  }
  try {
    const result = await enhanceWithAI({ variables: { text: content } })
    const enhanced = result?.data?.enhanceWithAI
    if (enhanced != null && enhanced !== '') {
      // Quill expects HTML; wrap plain text in a paragraph so the editor updates correctly
      const html = /<[a-z][\s\S]*>/i.test(enhanced) ? enhanced : `<p>${enhanced}</p>`
      setForm((f) => ({ ...f, content: html }))
      // setEditorKey((k) => k + 1)
    }
  } catch (_) {
    // onError already shows alert
  }
}

if (!isLoggedIn) return null

const isFormOpen = showForm || editingId

return (
  <div className="animate-fade-in">
    <header className="mb-8">
      <h1 className="heading-display text-3xl text-surface-900">{user?.name ? `${user.name}'s Dashboard` : 'My Dashboard'}</h1>
      <p className="mt-2 text-surface-500">Create and manage your posts.</p>
    </header>

    <section className="card p-6 sm:p-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="shrink-0">
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-2 border-surface-200"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full bg-surface-200 flex items-center justify-center text-2xl font-semibold text-surface-600 border-2 border-surface-200"
              aria-hidden
            >
              {(user?.name ?? 'U').split(/\s+/).map((s) => s[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-semibold text-surface-900">{user?.name ?? 'User'}</h2>
          {profile?.bio ? (
            <p className="mt-2 text-surface-600 text-[15px] leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          ) : (
            <p className="mt-2 text-surface-400 text-sm italic">No bio yet.</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
            <span className="font-medium text-surface-700">
              <strong className="text-surface-900">{myPosts.length}</strong> post{myPosts.length !== 1 ? 's' : ''}
            </span>
            <span className="font-medium text-surface-700">
              <strong className="text-surface-900">{profile?.followersCount ?? 0}</strong> follower{(profile?.followersCount ?? 0) !== 1 ? 's' : ''}
            </span>
            <span className="font-medium text-surface-700">
              <strong className="text-surface-900">{profile?.followingCount ?? 0}</strong> following
            </span>
            <button
              type="button"
              onClick={() => setShowProfileEdit(true)}
              className="btn-secondary text-sm"
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>
    </section>

    {showProfileEdit && (
      <div className="card mb-8 p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-surface-900 mb-5">Edit profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <FormField label="Bio" optional>
            <textarea
              value={profileForm.bio}
              onChange={setProfileFormField('bio')}
              placeholder="A short bio about you..."
              rows={4}
              className="input-field resize-none"
            />
          </FormField>
          <FormField label="Avatar" optional error={profileUploadError}>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={profileAvatarRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleProfileAvatarChange}
                  disabled={profileUploading}
                  className="block max-w-xs text-sm text-surface-600 file:mr-3 file:rounded-lg file:border-0 file:bg-accent-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:hover:bg-accent-600"
                />
                {profileUploading && <span className="text-sm text-surface-500">Uploading…</span>}
              </div>
              <input
                value={profileForm.avatar}
                onChange={setProfileFormField('avatar')}
                placeholder="Or paste avatar image URL"
                className="input-field"
              />
              {profileForm.avatar && (
                <div className="mt-2">
                  <img src={profileForm.avatar} alt="" className="h-20 w-20 rounded-full object-cover border border-surface-200" />
                </div>
              )}
            </div>
          </FormField>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Save profile</button>
            <button type="button" onClick={() => { setShowProfileEdit(false); setProfileUploadError(null) }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    )}

    {!isFormOpen && (
      <button onClick={() => setShowForm(true)} className="btn-primary mb-8 inline-flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New post
      </button>
    )}

    {isFormOpen && (
      <div className="card mb-10 p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-surface-900 mb-5">
          {editingId ? 'Edit post' : 'Create post'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Title">
            <input value={form.title} onChange={set('title')} placeholder="Post title" className="input-field" />
          </FormField>
          {/* <FormField label="Content">
              <textarea value={form.content} onChange={set('content')} placeholder="Write your post..." rows={6} className="input-field resize-none" />
            </FormField> */}
          <FormField label="Content">
            <RichTextEditor
              key={editorKey}
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              placeholder="Write your post..."
              minHeight={220}
            />
          </FormField>

          <button
            type="button"
            onClick={handleEnhanceContent}
            disabled={enhancing}
            className="text-sm font-medium text-accent-600 hover:text-accent-700 disabled:opacity-50"
          >
            {enhancing ? 'Enhancing…' : 'Enhance with AI'}
          </button>

          <FormField label="Tags" optional>
            <input value={form.tags} onChange={set('tags')} placeholder="e.g. graphql, backend, api" className="input-field" />
          </FormField>
          <FormField label="Status">
            <select value={form.status} onChange={set('status')} className="input-field">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </FormField>
          <FormField label="Slug" optional>
            <input value={form.slug} onChange={set('slug')} placeholder="URL slug (auto-generated from title if empty)" className="input-field" />
          </FormField>
          <FormField label="Cover image" optional error={uploadError}>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block max-w-xs text-sm text-surface-600 file:mr-3 file:rounded-lg file:border-0 file:bg-accent-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:hover:bg-accent-600"
                />
                {uploading && <span className="text-sm text-surface-500">Uploading…</span>}
              </div>
              {form.coverImage && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-lg bg-surface-100 p-[5px] border border-surface-200 w-fit">
                    <img src={form.coverImage} alt="" className="h-24 w-40 rounded-[6px] object-cover" />
                  </div>
                  <button type="button" onClick={clearCover} className="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
                </div>
              )}
              <input value={form.coverImage} onChange={set('coverImage')} placeholder="Or paste image URL" className="input-field" />
            </div>
          </FormField>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Publish'}</button>
            <button type="button" onClick={() => { setEditingId(null); resetAndRefetch() }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    )}

    {loading ? (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="card animate-pulse p-5">
            <div className="h-5 w-2/3 rounded bg-surface-200" />
            <div className="mt-2 h-4 w-1/4 rounded bg-surface-100" />
          </div>
        ))}
      </div>
    ) : myPosts.length === 0 ? (
      <div className="card flex flex-col items-center justify-center py-14 text-center">
        <p className="text-surface-500">You haven't written any posts yet.</p>
        <button onClick={() => setShowForm(true)} className="btn-primary mt-4">Write your first post</button>
      </div>
    ) : (
      <ul className="space-y-4">
        {myPosts.map((post) => (
          <li key={post.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <Link to={`/post/${post.id}`} className="font-display font-semibold text-surface-900 hover:text-accent-500 line-clamp-1">{post.title}</Link>
              <p className="mt-1 text-sm text-surface-500">
                {post.status === 'draft' && <span className="text-amber-600 font-medium">Draft</span>}
                {post.status === 'draft' && ' · '}
                {post.comments?.length ?? 0} comments
                {(post.viewCount != null && post.viewCount > 0) && ` · ${post.viewCount} views`}
                {Array.isArray(post.tags) && post.tags.length > 0 && (
                  <span className="text-surface-400"> · {post.tags.map((t) => `#${t}`).join(' ')}</span>
                )}
                {post.publishedAt && <span className="text-surface-400"> · {formatPostDateShort(post.publishedAt)}</span>}
                {!post.publishedAt && post.createdAt && <span className="text-surface-400"> · {formatPostDateShort(post.createdAt)}</span>}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => startEdit(post)} className="btn-secondary py-2 text-sm">Edit</button>
              <button
                onClick={() => window.confirm('Delete this post?') && deletePost({ variables: { id: post.id } }).catch(console.error)}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
)
}
