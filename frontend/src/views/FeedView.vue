<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { apolloClient } from '@/apollo/client'
import type { FeedPost } from '@/apollo/cacheUpdates'
import { removePostFromFeedCache } from '@/apollo/cacheUpdates'
import { POSTS_QUERY, DELETE_POST_MUTATION } from '@/graphql/posts'
import { useAuth } from '@/composables/useAuth'

type PostsQueryData = {
  posts: FeedPost[]
}

const { result, loading, error } = useQuery<PostsQueryData>(POSTS_QUERY)

const { user } = useAuth()

const posts = computed(() => result.value?.posts ?? [])

async function handleDelete(id: string) {
  try {
    await apolloClient.mutate({
      mutation: DELETE_POST_MUTATION,
      variables: { id },
    })
    removePostFromFeedCache(id)
  } catch (err) {
    console.error(err)
  }
}

const formatDate = (dateText: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(dateText),
  )
</script>

<template>
  <main class="page">
    <h1>Blog Feed</h1>
    <p class="subtitle">Latest plain-text posts from all users.</p>

    <p v-if="loading">Loading posts...</p>
    <p v-else-if="error" class="error">{{ error.message }}</p>
    <p v-else-if="posts.length === 0">No posts yet. Be the first to publish one.</p>

    <section v-else class="posts">
      <article v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <h2>{{ post.title }}</h2>
          <button
            v-if="user?.id === post.author.id"
            type="button"
            class="delete-button"
            @click="handleDelete(post.id)"
          >
            Delete
          </button>
        </div>
        <p class="meta">
          By {{ post.author.email }} · {{ formatDate(post.createdAt) }}
        </p>
        <p>{{ post.body }}</p>
      </article>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.subtitle {
  margin-top: 0.25rem;
  color: #6b7280;
}
.error {
  color: #dc2626;
}
.posts {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}
.post-card {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 1rem;
}
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}
.delete-button {
  border: 0;
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  background: #dc2626;
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
}
.meta {
  color: #6b7280;
  font-size: 0.9rem;
}
</style>
