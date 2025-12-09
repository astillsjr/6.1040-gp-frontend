// Pinia store for notification UI management
// This store handles displaying notifications in the UI.
// Domain-specific stores (requestStore, transactionStore, etc.) handle their own state
// and call methods here to show notifications when relevant events occur.
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ItemRequest } from '@/api/itemRequesting'
import type { ItemTransaction } from '@/api/itemTransaction'
import type { Item } from '@/api/items'
import * as userProfileAPI from '@/api/userProfile'

export interface ActiveNotification {
  notificationId: string
  type: 'notification' | 'request_accepted' | 'transaction_created' | 'message'
  title: string
  message: string
  itemId?: string
  itemTitle?: string
  itemImage?: string
  requestId?: string
  transactionId?: string
  conversationId?: string
  timestamp: Date
  read: boolean
  // User info for context
  userName?: string
  userAvatar?: string
  // Additional context
  transactionType?: 'BORROW' | 'TRANSFER'
  data?: any // Original event data
}

export const useNotificationStore = defineStore('notification', () => {
  // State - all notifications (for notification center)
  const allNotifications = ref<ActiveNotification[]>([])
  // Legacy: active notifications shown as cards (deprecated, will be removed)
  const activeNotifications = ref<ActiveNotification[]>([])
  const notificationQueue = ref<ActiveNotification[]>([])

  // Load notifications from localStorage on initialization
  function loadNotifications() {
    try {
      const stored = localStorage.getItem('localLoop_notifications')
      if (stored) {
        const data = JSON.parse(stored)
        allNotifications.value = data.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }))
      }
    } catch (err) {
      console.error('Failed to load notifications from localStorage:', err)
    }
  }

  // Save notifications to localStorage
  function saveNotifications() {
    try {
      localStorage.setItem('localLoop_notifications', JSON.stringify(allNotifications.value))
    } catch (err) {
      console.error('Failed to save notifications to localStorage:', err)
    }
  }

  // Initialize on store creation
  loadNotifications()

  // Actions

  // Handle general notifications from backend
  function handleNotification(notification: any) {
    // Check for duplicates in allNotifications (not just activeNotifications)
    const existing = allNotifications.value.find(n => n.notificationId === notification._id)
    if (existing) {
      // Notification already exists, don't add again
      return
    }

    // Create notification object
    const activeNotif: ActiveNotification = {
      notificationId: notification._id,
      type: 'notification',
      title: notification.title || 'New Notification',
      message: notification.content || '',
      timestamp: new Date(notification.createdAt),
      read: false,
      data: notification,
    }

    // Add to all notifications (for notification center)
    allNotifications.value.unshift(activeNotif)
    saveNotifications()
    
    // Legacy: Add to queue or show immediately (deprecated)
    if (activeNotifications.value.length === 0) {
      activeNotifications.value.push(activeNotif)
    } else {
      notificationQueue.value.push(activeNotif)
    }
  }

  // Show notification when a request is accepted (called by requestStore)
  async function showRequestAcceptedNotification(
    request: ItemRequest,
    itemDetails: Item,
    ownerProfile?: { displayName: string; _id: string }
  ) {
    const notificationId = `request_${request._id}`
    
    // Check for duplicates in allNotifications
    const existing = allNotifications.value.find(n => n.notificationId === notificationId)
    if (existing) {
      // Notification already exists, don't add again
      return
    }

    // Fetch owner profile if not provided
    let ownerName = 'the owner'
    let ownerAvatar: string | undefined
    if (ownerProfile) {
      ownerName = ownerProfile.displayName
      ownerAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ownerName)}`
    } else {
      try {
        // Get owner ID from item (itemDetails.owner is the owner ID)
        const profile = await userProfileAPI.getProfile({ user: itemDetails.owner })
        if (profile) {
          ownerName = profile.displayName
          ownerAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ownerName)}`
        }
      } catch (err) {
        console.error('Failed to fetch owner profile for notification:', err)
      }
    }

    const activeNotif: ActiveNotification = {
      notificationId,
      type: 'request_accepted',
      title: 'Request Accepted!',
      message: `${ownerName} accepted your request for "${itemDetails.title}"`,
      requestId: request._id,
      itemId: request.item,
      itemTitle: itemDetails.title,
      // itemImage will be fetched separately if needed (Item type doesn't have image)
      userName: ownerName,
      userAvatar: ownerAvatar,
      timestamp: new Date(),
      read: false,
      data: { request, itemDetails },
    }

    // Add to all notifications (for notification center)
    allNotifications.value.unshift(activeNotif)
    saveNotifications()

    // Legacy: Add to queue or show immediately (deprecated)
    if (activeNotifications.value.length === 0) {
      activeNotifications.value.push(activeNotif)
    } else {
      notificationQueue.value.push(activeNotif)
    }
  }

  // Show notification when a transaction is created (called by transactionStore)
  async function showTransactionCreatedNotification(
    transaction: ItemTransaction,
    itemDetails: Item,
    otherUserProfile?: { displayName: string; _id: string },
    currentUserId?: string
  ) {
    const notificationId = `transaction_${transaction._id}`
    
    // Check for duplicates in allNotifications
    const existing = allNotifications.value.find(n => n.notificationId === notificationId)
    if (existing) {
      // Notification already exists, don't add again
      return
    }

    // Determine who the other user is (the one who wants to borrow/transfer)
    // If currentUserId is the owner (from), then 'to' is the requester
    // If currentUserId is the requester (to), then 'from' is the owner
    const otherUserId = currentUserId === transaction.from ? transaction.to : transaction.from
    const transactionType = transaction.type as 'BORROW' | 'TRANSFER'
    const action = transactionType === 'BORROW' ? 'borrow' : 'transfer'

    // Fetch other user profile if not provided
    let otherUserName = 'Someone'
    let otherUserAvatar: string | undefined
    if (otherUserProfile) {
      otherUserName = otherUserProfile.displayName
      otherUserAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(otherUserName)}`
    } else {
      try {
        const profile = await userProfileAPI.getProfile({ user: otherUserId })
        if (profile) {
          otherUserName = profile.displayName
          otherUserAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(otherUserName)}`
        }
      } catch (err) {
        console.error('Failed to fetch user profile for notification:', err)
      }
    }

    const activeNotif: ActiveNotification = {
      notificationId,
      type: 'transaction_created',
      title: transactionType === 'BORROW' ? 'New Borrow Request!' : 'New Transfer Request!',
      message: `${otherUserName} wants to ${action} "${itemDetails.title}"`,
      transactionId: transaction._id,
      itemId: transaction.item,
      itemTitle: itemDetails.title,
      // itemImage will be fetched separately if needed (Item type doesn't have image)
      userName: otherUserName,
      userAvatar: otherUserAvatar,
      transactionType,
      timestamp: new Date(),
      read: false,
      data: { transaction, itemDetails },
    }

    // Add to all notifications (for notification center)
    allNotifications.value.unshift(activeNotif)
    saveNotifications()

    // Legacy: Add to queue or show immediately (deprecated)
    if (activeNotifications.value.length === 0) {
      activeNotifications.value.push(activeNotif)
    } else {
      notificationQueue.value.push(activeNotif)
    }
  }

  // Show notification when a new message is received (called by messageStore)
  async function showMessageNotification(
    backendMessage: any,
    senderProfile?: { displayName: string; _id: string }
  ) {
    const notificationId = `message_${backendMessage._id}`
    
    // Check for duplicates in allNotifications
    const existing = allNotifications.value.find(n => n.notificationId === notificationId)
    if (existing) {
      // Notification already exists, don't add again
      return
    }

    // Fetch sender profile if not provided
    let senderName = 'Someone'
    let senderAvatar: string | undefined
    if (senderProfile) {
      senderName = senderProfile.displayName
      senderAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(senderName)}`
    } else if (backendMessage.author) {
      try {
        const profile = await userProfileAPI.getProfile({ user: backendMessage.author })
        if (profile) {
          senderName = profile.displayName
          senderAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(senderName)}`
        }
      } catch (err) {
        console.error('Failed to fetch sender profile for notification:', err)
      }
    }

    const messagePreview = backendMessage.content || 'You have a new message'
    const truncatedMessage = messagePreview.length > 60 
      ? messagePreview.substring(0, 60) + '...' 
      : messagePreview

    const activeNotif: ActiveNotification = {
      notificationId,
      type: 'message',
      title: 'New Message',
      message: `${senderName}: ${truncatedMessage}`,
      conversationId: backendMessage.conversation,
      userName: senderName,
      userAvatar: senderAvatar,
      timestamp: new Date(backendMessage.createdAt),
      read: false,
      data: backendMessage,
    }

    // Add to all notifications (for notification center)
    allNotifications.value.unshift(activeNotif)
    saveNotifications()

    // Legacy: Add to queue or show immediately (deprecated)
    if (activeNotifications.value.length === 0) {
      activeNotifications.value.push(activeNotif)
    } else {
      notificationQueue.value.push(activeNotif)
    }
  }

  function dismissNotification(notificationId: string) {
    // Remove from allNotifications
    allNotifications.value = allNotifications.value.filter(
      n => n.notificationId !== notificationId
    )
    saveNotifications()
    
    // Legacy: Remove from activeNotifications
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
    allNotifications.value = []
    saveNotifications()
  }

  // Mark notification as read
  function markAsRead(notificationId: string) {
    const notification = allNotifications.value.find(n => n.notificationId === notificationId)
    if (notification) {
      notification.read = true
      saveNotifications()
    }
  }

  // Mark all notifications as read
  function markAllAsRead() {
    allNotifications.value.forEach(n => n.read = true)
    saveNotifications()
  }

  // Get unread count
  const unreadCount = computed(() => {
    return allNotifications.value.filter(n => !n.read).length
  })

  return {
    // State
    allNotifications,
    activeNotifications, // Legacy, deprecated
    notificationQueue, // Legacy, deprecated
    unreadCount,
    // Actions
    handleNotification,
    showRequestAcceptedNotification,
    showTransactionCreatedNotification,
    showMessageNotification,
    dismissNotification,
    showNextNotification,
    clearAllNotifications,
    markAsRead,
    markAllAsRead,
  }
})
