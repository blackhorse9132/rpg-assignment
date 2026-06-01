import { apolloClient } from '@/apollo/client';
import { POSTS_QUERY } from '@/graphql/posts';

export type FeedPost = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    email: string;
  };
};

export function prependPostToFeedCache(post: FeedPost) {
  apolloClient.cache.updateQuery<{ posts: FeedPost[] }>({ query: POSTS_QUERY }, (existing) => {
    if (!existing?.posts) {
      return existing;
    }

    if (existing.posts.some((item) => item.id === post.id)) {
      return existing;
    }

    return { posts: [post, ...existing.posts] };
  });
}

export function removePostFromFeedCache(postId: string) {
  apolloClient.cache.updateQuery<{ posts: FeedPost[] }>({ query: POSTS_QUERY }, (existing) => {
    if (!existing?.posts) return existing;
    return { posts: existing.posts.filter((p) => p.id !== postId) };
  });
}