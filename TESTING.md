# Testing the GraphQL Blog API

## 1. Start MongoDB

Make sure MongoDB is running locally (your app uses `mongodb://127.0.0.1:27017/blogDB`):

```bash
# If installed via Homebrew on Mac:
brew services start mongodb-community

# Or run once:
mongod
```

## 2. Start the API server

The server lives in the `server/` folder. First time, install dependencies:

```bash
cd server && npm install
```

Then start the server (from project root or from `server/`):

```bash
# From project root:
npm run server

# Or from server folder:
cd server && npm start
```

You should see: `Server running at http://localhost:5005/` and `MongoDB Connected`.

## 3. Run the React blog (optional)

The client lives in the `client/` folder. First time, install dependencies:

```bash
cd client && npm install
```

Then start the dev server (from project root or from `client/`):

```bash
# From project root:
npm run client

# Or from client folder:
cd client && npm run dev
```

Then open **http://localhost:3000**. The app uses the GraphQL API from step 2 (ensure the API is running on port 5005).

---

## 4. Open Apollo Sandbox (GraphQL Playground)

1. Go to **https://studio.apollo.dev/sandbox**
2. Set the endpoint to: **http://localhost:5005/graphql**
3. Use the panel to run queries and mutations.

(If you use the React app, it talks to the API via the Vite proxy at `/graphql`, so you don’t need to change the Sandbox endpoint.)

---

## Example operations to try

### Queries (no auth)

**All users with posts and comments:**
```graphql
query {
  users {
    name
    email
    posts {
      title
      comments {
        text
        author { name }
      }
    }
  }
}
```

**Single user by ID:**
```graphql
query {
  user(id: "PASTE_USER_ID_HERE") {
    name
    email
    posts { title content }
  }
}
```

**All posts with author and comments:**
```graphql
query {
  posts {
    title
    content
    author { name }
    comments { text author { name } }
  }
}
```

---

### Mutations (create data)

**Register a new user:**
```graphql
mutation {
  register(name: "Test User", email: "test@example.com", password: "secret123") {
    token
    user { id name email }
  }
}
```

**Login (copy the token for auth):**
```graphql
mutation {
  login(email: "test@example.com", password: "secret123") {
    token
    user { id name email }
  }
}
```
Copy the `token` value from the response. You will use it in the next step.

---

### Authenticated requests (update/delete)

`updatePost`, `deletePost`, `updateComment`, `deleteComment`, `updateUser`, and `deleteUser` require a valid JWT.

**In Apollo Sandbox:**

1. Run the **login** mutation above and copy the returned `token`.
2. Click **Headers** (or the "+" next to the operation panel).
3. Add a header:
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR_TOKEN_HERE` — you must include the word **Bearer** followed by a **space**, then paste your token. Without "Bearer " the server returns "Not authenticated".

Example (replace with your actual token):
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

4. Run your mutation (e.g. `updatePost`). The server will read the token from this header.

**Create a post** (use a real `userId` from your DB):
```graphql
mutation {
  createPost(title: "Hello GraphQL", content: "This is my first post.", userId: "USER_ID_HERE") {
    id
    title
    author { name }
  }
}
```

**Create a comment** (use real `postId` and optional `userId`):
```graphql
mutation {
  createComment(text: "Great post!", postId: "POST_ID_HERE", userId: "USER_ID_HERE") {
    id
    text
    author { name }
  }
}
```

---

Then run for example:

**Update your post:**
```graphql
mutation {
  updatePost(id: "POST_ID", title: "Updated title", content: "Updated content") {
    id
    title
    content
  }
}
```

**Delete your post:**
```graphql
mutation {
  deletePost(id: "POST_ID")
}
```

---

## Quick test with cURL

**Query:**
```bash
curl -X POST http://localhost:5005/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ users { name posts { title } } }"}'
```

**Login:**
```bash
curl -X POST http://localhost:5005/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(email: \"test@example.com\", password: \"secret123\") { token user { name } } }"}'
```

Use the returned `token` in the `Authorization: Bearer <token>` header for protected mutations.
