// Pinia store for notification UI management
// This store handles displaying notifications in the UI.
// Domain-specific stores (requestStore, transactionStore, etc.) handle their own state
// and call methods here to show notifications when relevant events occur.
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ItemRequest } from '@/api/itemRequesting'
import type { ItemTransaction } from '@/api/itemTransaction'
import type { Item } from '@/api/items'

export interface ActiveNotification {
  notificationId: string
  type: 'notification' | 'request_accepted' | 'transaction_created' | 'message'
  title: string
  message: string
  itemId?: string
  requestId?: string
  transactionId?: string
  conversationId?: string
  timestamp: Date
  data?: any // Original event data
}

export const useNotificationStore = defineStore('notification', () => {
  // State
  const activeNotifications = ref<ActiveNotification[]>([])
  const notificationQueue = ref<ActiveNotification[]>([])

  // Actions

  // Handle general notifications from backend
  function handleNotification(notification: any) {
    // Check for duplicates
    const existing = activeNotifications.value.find(n => n.notificationId === notification._id)
    if (existing) return

    // Create notification object
    const activeNotif: ActiveNotification = {
      notificationId: notification._id,
      type: 'notification',
      title: notification.title || 'New Notification',
      message: notification.content || '',
      timestamp: new Date(notification.createdAt),
      data: notification,
    }

    // Add to queue or show immediately
    if (activeNotifications.value.length === 0) {
      activeNotifications.value.push(activeNotif)
    } else {
      notificationQueue.value.push(activeNotif)
    }
  }

  // Show notification when a request is accepted (called by requestStore)
  function showRequestAcceptedNotification(request: ItemRequest, itemDetails: Item) {
    const notificationId = `request_${request._id}`
    
    // Check for duplicates
    const existing = activeNotifications.value.find(n => n.notificationId === notificationId)
    if (existing) return

    const activeNotif: ActiveNotification = {
      notificationId,
      type: 'request_accepted',
      title: 'Request Accepted!',
      message: `Your request for "${itemDetails.title}" has been accepted!`,
      requestId: request._id,
      itemId: request.item,
      timestamp: new Date(),
      data: { request, itemDetails },
    }

    if (activeNotifications.value.length === 0) {
      activeNotifications.value.push(activeNotif)
    } else {
      notificationQueue.value.push(activeNotif)
    }
  }

  // Show notification when a transaction is created (called by transactionStore)
  function showTransactionCreatedNotification(transaction: ItemTransaction, itemDetails: Item) {
    const notificationId = `transaction_${transaction._id}`
    
    // Check for duplicates
    const existing = activeNotifications.value.find(n => n.notificationId === notificationId)
    if (existing) return

    const activeNotif: ActiveNotification = {
      notificationId,
      type: 'transaction_created',
      title: 'New Transaction!',
      message: `Someone wants to borrow "${itemDetails.title}"!`,
      transactionId: transaction._id,
      itemId: transaction.item,
      timestamp: new Date(),
      data: { transaction, itemDetails },
    }

    if (activeNotifications.value.length === 0) {
      activeNotifications.value.push(activeNotif)
    } else {
      notificationQueue.value.push(activeNotif)
    }
  }

  // Show notification when a new message is received (called by messageStore)
  function showMessageNotification(backendMessage: any) {
    const notificationId = `message_${backendMessage._id}`
    
    // Check for duplicates
    const existing = activeNotifications.value.find(n => n.notificationId === notificationId)
    if (existing) return

    const activeNotif: ActiveNotification = {
      notificationId,
      type: 'message',
      title: 'New Message',
      message: backendMessage.content || 'You have a new message',
      conversationId: backendMessage.conversation,
      timestamp: new Date(backendMessage.createdAt),
      data: backendMessage,
    }

    if (activeNotifications.value.length === 0) {
      activeNotifications.value.push(activeNotif)
    } else {
      notificationQueue.value.push(activeNotif)
    }
  }

  function dismissNotification(notificationId: string) {
    activeNotifications.value = activeNotifications.value.filter(
      n => n.notificationId !== notificationId
    )
    
    // Show next notification after a delay
    setTimeout(() => {
      showNextNotification()
    }, 500)
  }

  function showNextNotification() {
    if (notificationQueue.value.length > 0 && activeNotifications.value.length === 0) {
      const next = notificationQueue.value.shift()
      if (next) {
        activeNotifications.value.push(next)
      }
    }
  }

  function clearAllNotifications() {
    activeNotifications.value = []
    notificationQueue.value = []
  }

  return {
    // State
    activeNotifications,
    notificationQueue,
    // Actions
    handleNotification,
    showRequestAcceptedNotification,
    showTransactionCreatedNotification,
    showMessageNotification,
    dismissNotification,
    showNextNotification,
    clearAllNotifications,
  }
})
