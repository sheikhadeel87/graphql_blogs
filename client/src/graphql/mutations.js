import { gql } from '@apollo/client'

export const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
        avatar
      }
    }
  }
`

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        avatar
      }
    }
  }
`

export const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!, $userId: ID!, $coverImage: String, $tags: [String], $status: String, $publishedAt: String, $slug: String) {
    createPost(title: $title, content: $content, userId: $userId, coverImage: $coverImage, tags: $tags, status: $status, publishedAt: $publishedAt, slug: $slug) {
      id
      title
      slug
      content
      coverImage
      tags
      status
      viewCount
      publishedAt
      createdAt
      author {
        id
        name
      }
    }
  }
`

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $title: String, $content: String, $coverImage: String, $tags: [String], $status: String, $publishedAt: String, $slug: String) {
    updatePost(id: $id, title: $title, content: $content, coverImage: $coverImage, tags: $tags, status: $status, publishedAt: $publishedAt, slug: $slug) {
      id
      title
      slug
      content
      coverImage
      tags
      status
      viewCount
      publishedAt
      createdAt
      author {
        id
        name
      }
    }
  }
`

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`

export const SINGLE_UPLOAD = gql`
  mutation SingleUpload($file: Upload!) {
    singleUpload(file: $file)
  }
`

export const CREATE_COMMENT = gql`
  mutation CreateComment($text: String!, $postId: ID!, $userId: ID) {
    createComment(text: $text, postId: $postId, userId: $userId) {
      id
      text
      author {
        id
        name
      }
    }
  }
`

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likes
      likedBy { id name }
    }
  }
`

export const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId) {
      id
      likes
      likedBy { id name }
    }
  }
`
export const ENHANCE_WITH_AI = gql`
  mutation EnhanceWithAI($text: String!) {
    enhanceWithAI(text: $text)
  }
`

export const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      id
      name
      avatar
      followers { id }
      following { id }
    }
  }
`

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) {
      id
      name
      avatar
      followers { id }
      following { id }
    }
  }
`

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String, $avatar: String, $bio: String) {
    updateUser(id: $id, name: $name, avatar: $avatar, bio: $bio) {
      id
      name
      email
      avatar
      bio
    }
  }
`
