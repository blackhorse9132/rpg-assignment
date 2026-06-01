<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apolloClient } from '@/apollo/client'
import type { FeedPost } from '@/apollo/cacheUpdates'
import { prependPostToFeedCache } from '@/apollo/cacheUpdates'
import { CREATE_POST_MUTATION } from '@/graphql/posts'

type CreatePostMutationData = {
  createPost: FeedPost
}

const router = useRouter()
const title = ref('')
const body = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await apolloClient.mutate<CreatePostMutationData>({
      mutation: CREATE_POST_MUTATION,
      variables: {
        input: {
          title: title.value,
          body: body.value,
        },
      },
    })

    const createdPost = response.data?.createPost
    if (createdPost) {
      prependPostToFeedCache(createdPost)
    }

    await router.push({ name: 'feed' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to create post'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="page">
    <h1>Create Post</h1>
    <form class="form" @submit.prevent="handleSubmit">
      <label>
        Title
        <input v-model="title" type="text" required maxlength="120" />
      </label>
      <label>
        Body
        <textarea v-model="body" required maxlength="5000" rows="8" />
      </label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Publishing...' : 'Publish post' }}
      </button>
    </form>
  </main>
</template>

<style scoped>
.page {
  max-width: 680px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.form {
  display: grid;
  gap: 1rem;
}
label {
  display: grid;
  gap: 0.5rem;
}
input,
textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font: inherit;
}
button {
  border: 0;
  border-radius: 6px;
  padding: 0.65rem 1rem;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.error {
  color: #dc2626;
}
</style>
