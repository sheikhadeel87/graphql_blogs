# Summary of Changes Made

This document lists all changes made during our session.

---

## 1. Color scheme (elegant blue)

**File:** `client/tailwind.config.js`

- **Accent palette** set to blue family **rgb(79 133 245)** (#4f85f5):
  - `accent` 50–900 (e.g. 500: `#4f85f5`, 600: `#3b72e8`)
- **Glow** shadow uses `rgb(79 133 245)`
- **gradient-accent**: `#4f85f5` → `#3b72e8`
- **gradient-mesh**: blue tint instead of purple

---

## 2. Tags on posts

**Files:** `client/src/graphql/queries.js`, `client/src/pages/Home.jsx`, `client/src/pages/Post.jsx`, `client/src/pages/Dashboard.jsx`, `client/src/graphql/mutations.js`

- **Queries:** Added `tags` to `GET_POSTS_PAGINATED` and `GET_POST`
- **Home:** Tags shown under each post card as `#tag1 #tag2`
- **Post page:** Tags shown under the post header
- **Dashboard:** Tags input in create/edit form (comma- or space-separated); tags sent in create/update; tags shown in post list
- **Mutations:** `CREATE_POST` and `UPDATE_POST` accept and return `tags`

---

## 3. Post schema: slug, status, viewCount, publishedAt

### Server

**`server/models/Post.js`**
- Added **slug** (unique, auto-generated from title via `slugify()`)
- **status**: `draft` | `published` (default `draft`)
- **viewCount** (default 0), **publishedAt** (Date, default null)
- **Pre-save hook:** Generates/updates `slug` from `title`; sets `publishedAt` when `status === 'published'`
- **Pre-save fix:** Hook is `async function ()` with no `next` (avoids "next is not a function" error)

**`server/schema/typeDefs.js`**
- **Post** type: `slug`, `status`, `viewCount`, `publishedAt`
- **PostFilterInput:** `status`
- **createPost / updatePost:** optional `slug`, `status`, `publishedAt`
- **Query:** `postBySlug(slug: String!): Post`

**`server/schema/resolvers.js`**
- **posts:** Filter by `status` and by `author` (not `userId`); sort option `publishedAt`
- **post(id):** Increments `viewCount` and returns single post
- **postBySlug(slug):** Fetches by slug and increments `viewCount`
- **createPost / updatePost / deletePost:** Use `post.author` for auth (not `userId`)
- **User.posts:** `Post.find({ author: id })`
- **Post.author:** Uses `parent.author` (not `parent.userId`)
- **Post:** Resolvers for `viewCount` (number) and `publishedAt` (ISO string)

### Client

**`client/src/graphql/queries.js`**
- List and single-post queries request `slug`, `status`, `viewCount`, `publishedAt`
- Added **GET_POST_BY_SLUG** for fetching by slug

**`client/src/graphql/mutations.js`**
- **CREATE_POST / UPDATE_POST:** Variables and selection include `slug`, `status`, `publishedAt`, `tags`

**`client/src/pages/Home.jsx`**
- **publicListFilter** = `{ status: 'published' }` so list shows only published by default
- **filterForQuery:** Uses `publicListFilter` when no other filters
- Cards show **viewCount** and **publishedAt** (or **createdAt**)

**`client/src/pages/Post.jsx`**
- Shows **viewCount** and **publishedAt** (or **createdAt**)
- Article has class **single-post-page** and **data-post-id** for the single-post view

**`client/src/pages/Dashboard.jsx`**
- Form state: **status** (default `'published'`), **slug** (optional)
- **Status** dropdown (Draft / Published) and **Slug** input
- **handleSubmit:** Sends `status`, `publishedAt` (when published), `slug`, `tags`
- **startEdit:** Pre-fills `status` and `slug`
- List row shows Draft badge, views, tags, **publishedAt** (or **createdAt**)

---

## 4. “Read more” / single post page

**`client/src/App.jsx`**
- **Route order:** `/post/:id` is declared **before** `/` so the post page is matched first and only one page renders.

**`client/src/pages/Post.jsx`**
- Single post wrapper: `<article className="animate-fade-in single-post-page" data-post-id={post.id}>` so the detail view is clearly one post only.

---

## File list (all touched files)

| File | Changes |
|------|--------|
| `client/tailwind.config.js` | Blue accent (79 133 245), glow, gradients |
| `client/src/App.jsx` | Route order: `/post/:id` before `/` |
| `client/src/graphql/queries.js` | `tags`, `slug`, `status`, `viewCount`, `publishedAt`; `GET_POST_BY_SLUG` |
| `client/src/graphql/mutations.js` | CREATE/UPDATE_POST: `tags`, `slug`, `status`, `publishedAt` |
| `client/src/pages/Home.jsx` | Tags, viewCount, publishedAt, publicListFilter, filterForQuery |
| `client/src/pages/Post.jsx` | Tags, viewCount, publishedAt, single-post-page wrapper |
| `client/src/pages/Dashboard.jsx` | Tags, status, slug in form and submit; list shows status, views, tags, dates |
| `server/models/Post.js` | slug, slugify, pre-save (no `next`), status, viewCount, publishedAt |
| `server/schema/typeDefs.js` | Post slug/status/viewCount/publishedAt; filter status; postBySlug; mutations |
| `server/schema/resolvers.js` | post/postBySlug, posts filter, author vs userId, viewCount/publishedAt resolvers |

---

*Generated as a summary of session changes.*
