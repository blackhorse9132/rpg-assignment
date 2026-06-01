import { computed, ref } from 'vue';
import { apolloClient } from '@/apollo/client';
import { BLOG_PUBLISHED_SUBSCRIPTION } from '@/graphql/posts';
import { useToast } from '@/composables/useToast';
import { prependPostToFeedCache } from '@/apollo/cacheUpdates';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

const notifications = ref<NotificationItem[]>([]);
let unsubscribe: (() => void) | null = null;

type BlogPublishedResult = {
  data?: {
    blogPublished?: {
      post: { id: string; title: string; body: string; createdAt: string; author: { id: string; email: string } };
      message: string;
      createdAt: string;
    };
  };
};

type Subscribable = {
  subscribe: (observer: {
    next: (result: BlogPublishedResult) => void;
    error: (error: unknown) => void;
  }) => { unsubscribe: () => void };
};

function addNotification(item: Omit<NotificationItem, 'read'>) {
  notifications.value.unshift({ ...item, read: false });
}

function markAsRead(id: string) {
  const notification = notifications.value.find((item) => item.id === id);
  if (notification) {
    notification.read = true;
  }
}

function markAllAsRead() {
  for (const notification of notifications.value) {
    notification.read = true;
  }
}

function clearNotifications() {
  notifications.value = [];
}

const unreadCount = computed(
  () => notifications.value.filter((item) => !item.read).length,
);

function startNotifications() {
  if (unsubscribe) {
    return;
  }

  const { showToast } = useToast();

  const subscription = apolloClient.subscribe<{
    blogPublished: {
      post: { id: string; title: string; body: string; createdAt: string; author: { id: string; email: string } };
      message: string;
      createdAt: string;
    };
  }>({
    query: BLOG_PUBLISHED_SUBSCRIPTION,
  });

  const activeSubscription = (subscription as unknown as Subscribable).subscribe({
    next: (result) => {
      const payload = result.data?.blogPublished;
      if (!payload) {
        return;
      }

      prependPostToFeedCache({
        id: payload.post.id,
        title: payload.post.title,
        body: payload.post.body,
        createdAt: payload.post.createdAt,
        author: payload.post.author,
      });

      const title = 'New blog published';
      const message = `${payload.post.author.email} posted "${payload.post.title}"`;

      addNotification({
        id: `${payload.post.id}-${payload.createdAt}`,
        title,
        message,
        createdAt: payload.createdAt,
      });

      showToast({
        type: 'success',
        title,
        message,
        duration: 7000,
      });
    },
    error: (error: unknown) => {
      console.error('Notification subscription failed', error);
    },
  });

  unsubscribe = () => activeSubscription.unsubscribe();
}

function stopNotifications() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

export function useNotifications() {
  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    startNotifications,
    stopNotifications,
  };
}
