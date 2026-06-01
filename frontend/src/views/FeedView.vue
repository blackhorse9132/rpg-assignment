<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import type { FeedPost } from '@/apollo/cacheUpdates'
import { POSTS_QUERY } from '@/graphql/posts'

type PostsQueryData = {
  posts: FeedPost[]
}

const { result, loading, error } = useQuery<PostsQueryData>(POSTS_QUERY)

const posts = computed(() => result.value?.posts ?? [])

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
        <h2>{{ post.title }}</h2>
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
.meta {
  color: #6b7280;
  font-size: 0.9rem;
}
</style>
