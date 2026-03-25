# Features

A full-stack blog application with a React frontend and a GraphQL API backend. Users can register, publish posts with cover images, comment, and like posts. The UI includes author avatars, an avatar-based user menu in the navbar, and a polished like button.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Authentication](#authentication)
- [Posts](#posts)
- [Comments](#comments)
- [Likes](#likes)
- [File Uploads](#file-uploads)
- [User Profile & Avatar](#user-profile--avatar)
- [UI & UX](#ui--ux)
- [GraphQL API Overview](#graphql-api-overview)
- [Security](#security)

---

## Tech Stack

| Layer   | Technology |
|--------|-------------|
| **Backend** | Node.js, Express, Apollo Server (GraphQL), MongoDB (Mongoose) |
| **Frontend** | React 18, Vite, React Router, Apollo Client |
| **Auth**     | JWT (Bearer token), bcrypt for password hashing |
| **Uploads**  | graphql-upload (multipart), apollo-upload-client |
| **Styling**  | Tailwind CSS |

---

## Authentication

- **Registration** – Sign up with name, email, and password. Passwords are hashed with bcrypt; the API returns a JWT and user payload.
- **Login** – Sign in with email and password; receive a JWT and user (id, name, email, avatar).
- **Session** – JWT stored in `localStorage`; sent as `Authorization: Bearer <token>` on GraphQL requests.
- **Protected routes** – Dashboard and authenticated actions (create/edit/delete post, like, comment) require a valid token.
- **Logout** – Clears token and user from storage; user menu in the navbar provides a dedicated Logout action.

---

## Posts

- **Create post** – Authenticated users can create posts with title, content, and optional cover image (via GraphQL file upload).
- **List posts** – Paginated list on the home page (configurable page size) with author, comment count, like count, and date.
- **Single post** – Dedicated post page with full content, cover image, author block, like control, and comments.
- **Update post** – Authors can edit title, content, and cover image from the Dashboard.
- **Delete post** – Authors can delete their posts from the Dashboard.
- **Cover images** – Optional image per post; stored under `/uploads` and served statically; displayed on cards and post detail.

---

## Comments

- **Add comment** – Logged-in users can comment on any post; comment form on the post detail page.
- **Display** – Comments shown with author (avatar + name), text, and timestamp.
- **Update / Delete** – Authors can update or delete their own comments (supported by the API).

---

## Likes

- **Like / Unlike** – Authenticated users can like or unlike a post via GraphQL mutations.
- **Count** – Like count shown on post cards and on the post detail page.
- **State** – “Liked” state is reflected in the UI (e.g. filled heart and “Liked” label) and persists across refetches.
- **UI** – Reusable like button with heart icon (filled when liked, outline when not), optional count, and clear visual states.

---

## File Uploads

- **GraphQL upload** – File uploads use the GraphQL multipart request spec (`graphql-upload` on the server, `apollo-upload-client` on the client).
- **Single upload** – `singleUpload(file: Upload!)` mutation returns a public URL (e.g. `/uploads/<filename>`).
- **Cover images** – Dashboard uses `singleUpload` for the chosen image, then passes the returned URL into `createPost` or `updatePost`.
- **Limits** – Configurable max file size and max files per request on the server.
- **Storage** – Files saved under `server/uploads` and served at `/uploads`.

---

## User Profile & Avatar

- **Avatar field** – User model and GraphQL `User` type include an optional `avatar` URL.
- **Update profile** – `updateUser` mutation supports updating name, email, password, and avatar.
- **Display** – Avatar shown next to author name on post cards, post header, and comments (circular image or initials fallback).
- **Navbar** – Logged-in users see a circular avatar (or initials) in the navbar; click opens a dropdown with name, email, Dashboard link, and Logout.

---

## UI & UX

- **Responsive layout** – Layout and typography adapt to different screen sizes.
- **Post author block** – Reusable “author” chip: circular avatar + name (grey), used on home, post detail, and comments.
- **Like button** – Single component for like/unlike with distinct visual states and optional count.
- **User menu** – Avatar in navbar opens a dropdown (name, email, Dashboard, Logout) with click-outside to close.
- **Loading & errors** – Loading skeletons and error alerts for key flows.
- **Navigation** – Sticky navbar with Blog home, Latest posts, Dashboard (when logged in), and avatar menu or Login / Sign up.

---

## GraphQL API Overview

### Queries

| Operation   | Description |
|------------|-------------|
| `posts(page, limit)` | Paginated list; returns `PostPagination` (posts, totalPosts, totalPages, currentPage). |
| `post(id)` | Single post by ID. |
| `users` / `user(id)` | List users or fetch one by ID. |
| `comments` / `comment(id)` | List comments or fetch one by ID. |

### Mutations

| Operation       | Description |
|----------------|-------------|
| `register`     | Create account; returns `AuthPayload` (token, user). |
| `login`        | Sign in; returns `AuthPayload`. |
| `createPost`   | Create post (title, content, userId, coverImage URL). |
| `updatePost`   | Update post (id, optional title, content, coverImage). |
| `deletePost`   | Delete post (author only). |
| `createComment`| Add comment to a post. |
| `updateComment`/ `deleteComment` | Edit or remove own comment. |
| `updateUser`   | Update own profile (name, email, password, avatar). |
| `singleUpload` | Upload a file; returns public URL. |
| `likePost` / `unlikePost` | Like or unlike a post (postId). |

### Types (summary)

- **User** – id, name, email, avatar, posts.
- **Post** – id, title, content, coverImage, author, comments, createdAt, likes, likedBy.
- **Comment** – id, text, author, post, createdAt.
- **PostPagination** – posts, totalPosts, totalPages, currentPage.
- **Upload** – Scalar for file upload variables.

---

## Security

- **Passwords** – Hashed with bcrypt before storage; never returned in API responses.
- **JWT** – Used for authenticated mutations and resolvers that need the current user (e.g. update/delete post, like, comment).
- **Authorization** – Post and comment update/delete restricted to the owner; like/unlike require a valid user.
- **ObjectId validation** – Server validates IDs before passing to MongoDB to avoid injection and bad data.
- **File upload** – Size and count limits enforced by the upload middleware.

---

## Running the Project

- **Server** – From `server/`: `npm install` then `npm start` (default port 5005). Ensure MongoDB is running and `uploads` exists (or is created at startup).
- **Client** – From `client/`: `npm install` then `npm run dev`. Configure API base URL / proxy so GraphQL and `/uploads` point to the server.

---

*This document reflects the current feature set of the GraphQL Blog API and its React client.*
