const typeDefs = `
type User {
  id: ID!
  name: String!
  email: String!
  avatar: String
  posts: [Post]
}

type AuthPayload {
  token: String!
  user: User!
}

type Post {
  id: ID!
  title: String!
  slug: String
  content: String!
  coverImage: String
  tags: [String]
  status: String
  author: User
  comments: [Comment]
  likes: Int!
  likedBy: [User!]!
  viewCount: Int!
  publishedAt: String
  createdAt: String
}

type Comment {
  id: ID!
  text: String!
  author: User
  post: Post
  createdAt: String
}

input PostFilterInput {
  title: String
  authorName: String
  tag: String
  status: String
  startDate: String
  endDate: String
  sortBy: String
}

type Query {
  users: [User]
  user(id: ID!): User
  posts(filter: PostFilterInput, page: Int, limit: Int): PostPagination
  post(id: ID!): Post
  postBySlug(slug: String!): Post
  comments: [Comment]
  comment(id: ID!): Comment
}

type Mutation {
  createUser(name: String!, email: String!): User
  createPost(title: String!, content: String!, userId: ID!, coverImage: String, tags: [String], status: String, publishedAt: String, slug: String): Post
  createComment(text: String!, postId: ID!, userId: ID): Comment
  register(name: String!, email: String!, password: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
  updatePost(id: ID!, title: String, content: String, coverImage: String, tags: [String], status: String, publishedAt: String, slug: String): Post
  deletePost(id: ID!): Boolean
  updateComment(id: ID!, text: String!): Comment
  deleteComment(id: ID!): Boolean
  updateUser(id: ID!, name: String, email: String, password: String, avatar: String): User
  deleteUser(id: ID!): Boolean
  singleUpload(file: Upload!): String
  likePost(postId: ID!): Post
  unlikePost(postId: ID!): Post
  enhanceWithAI(text: String!): String
}

scalar Upload

type PostPagination {
  posts: [Post]
  totalPosts: Int
  totalPages: Int
  currentPage: Int
}
`;

module.exports = typeDefs;
