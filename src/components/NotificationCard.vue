<template>
  <TransitionGroup
    name="notification"
    tag="div"
    class="fixed top-20 right-5 z-50 flex flex-col gap-3 max-w-sm w-full md:max-w-md"
  >
    <div
      v-for="notification in activeNotifications"
      :key="notification.notificationId"
      class="bg-card border-2 border-border rounded-lg shadow-lg p-4 animate-slide-in"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1">
          <h3 class="font-semibold text-foreground mb-1">{{ notification.title }}</h3>
          <p class="text-sm text-muted-foreground">{{ notification.message }}</p>
          <div class="flex gap-2 mt-3">
            <Button
              v-if="notification.itemId"
              size="sm"
              @click="handleViewItem(notification)"
              class="text-xs"
            >
              View Item
            </Button>
            <Button
              v-if="notification.requestId"
              size="sm"
              variant="outline"
              @click="handleViewRequest(notification)"
              class="text-xs"
            >
              View Request
            </Button>
            <Button
              v-if="notification.transactionId"
              size="sm"
              variant="outline"
              @click="handleViewTransaction(notification)"
              class="text-xs"
            >
              View Transaction
            </Button>
            <Button
              v-if="notification.conversationId"
              size="sm"
              variant="outline"
              @click="handleViewMessage(notification)"
              class="text-xs"
            >
              View Message
            </Button>
          </div>
        </div>
        <button
          @click="dismissNotification(notification.notificationId)"
          class="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div v-if="notificationQueue.length > 0" class="mt-2 text-xs text-muted-foreground">
        +{{ notificationQueue.length }} more
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import { Button } from '@/components/ui'

const router = useRouter()
const notificationStore = useNotificationStore()

const activeNotifications = computed(() => notificationStore.activeNotifications)
const notificationQueue = computed(() => notificationStore.notificationQueue)

function dismissNotification(notificationId: string) {
  notificationStore.dismissNotification(notificationId)
}

function handleViewItem(notification: any) {
  if (notification.itemId) {
    router.push(`/items/${notification.itemId}`)
    dismissNotification(notification.notificationId)
  }
}

function handleViewRequest(notification: any) {
  router.push('/activity')
  dismissNotification(notification.notificationId)
}

function handleViewTransaction(notification: any) {
  router.push('/activity')
  dismissNotification(notification.notificationId)
}

function handleViewMessage(notification: any) {
  // Navigate to messages/chat if you have that route
  // For now, just go to activity
  router.push('/activity')
  dismissNotification(notification.notificationId)
}
</script>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .fixed {
    left: 10px;
    right: 10px;
    max-width: none;
  }
}
</style>

