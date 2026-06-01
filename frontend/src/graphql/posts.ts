import { gql } from 'graphql-tag';

export const POSTS_QUERY = gql`
  query Posts {
    posts {
      id
      title
      body
      createdAt
      author {
        id
        email
      }
    }
  }
`;

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      body
      createdAt
      author {
        id
        email
      }
    }
  }
`;

export const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: String!) {
    deletePost(id: $id)
  }
`;

export const BLOG_PUBLISHED_SUBSCRIPTION = gql`
  subscription BlogPublished {
    blogPublished {
      message
      createdAt
      post {
        id
        title
        body
        createdAt
        author {
          id
          email
        }
      }
    }
  }
`;
