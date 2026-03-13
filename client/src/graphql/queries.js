import { gql } from '@apollo/client'

export const GET_POSTS_PAGINATED = gql`
  query GetPostsPaginated($filter: PostFilterInput, $page: Int, $limit: Int) {
    posts(filter: $filter, page: $page, limit: $limit) {
      posts {
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
        likes
        likedBy { id name }
        author { id name avatar }
        comments { id }
      }
      totalPosts
      totalPages
      currentPage
    }
  }
`

export const GET_POSTS = GET_POSTS_PAGINATED

export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
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
      likes
      likedBy { id name }
      author {
        id
        name
        email
        avatar
      }
      comments {
        id
        text
        createdAt
        author {
          id
          name
          avatar
        }
      }
    }
  }
`

export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: String!) {
    postBySlug(slug: $slug) {
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
      likes
      likedBy { id name }
      author {
        id
        name
        email
        avatar
      }
      comments {
        id
        text
        createdAt
        author {
          id
          name
          avatar
        }
      }
    }
  }
`
