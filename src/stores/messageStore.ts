// Pinia store for Message management
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as communicationAPI from '@/api/communication'
import type { BackendMessage } from '@/api/communication'

export interface Message {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  timestamp: Date
  read: boolean
  // Backend message ID if synced with backend
  backendId?: string
}

export interface Conversation {
  userId: string
  otherUserId: string
  itemId: string
  messages: Message[]
  lastMessageTime: Date
  // Backend conversation ID and transaction ID
  backendConversationId?: string
  transactionId?: string
}

export const useMessageStore = defineStore('message', () => {
  // State - stored in localStorage for persistence
  const conversations = ref<Map<string, Conversation>>(new Map())

  // Load conversations from localStorage on initialization
  function loadConversations() {
    try {
      const stored = localStorage.getItem('localLoop_conversations')
      if (stored) {
        const data = JSON.parse(stored)
        const loaded = new Map<string, Conversation>()
        
        for (const [key, conv] of Object.entries(data)) {
          const conversation = conv as Conversation
          // Convert timestamp strings back to Date objects
          conversation.messages = conversation.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
          conversation.lastMessageTime = new Date(conversation.lastMessageTime)
          loaded.set(key, conversation)
        }
        
        conversations.value = loaded
      }
    } catch (err) {
      console.error('Failed to load conversations from localStorage:', err)
    }
  }

  // Save conversations to localStorage
  function saveConversations() {
    try {
      const data: Record<string, Conversation> = {}
      conversations.value.forEach((conv, key) => {
        data[key] = conv
      })
      localStorage.setItem('localLoop_conversations', JSON.stringify(data))
    } catch (err) {
      console.error('Failed to save conversations to localStorage:', err)
    }
  }

  // Initialize on store creation
  loadConversations()

  // Get conversation key for two users and an item
  function getConversationKey(userId1: string, userId2: string, itemId: string): string {
    // Sort user IDs to ensure consistent key regardless of order
    const [user1, user2] = [userId1, userId2].sort()
    return `${user1}_${user2}_${itemId}`
  }

  // Get or create a conversation (local only)
  function getConversation(userId: string, otherUserId: string, itemId: string): Conversation {
    const key = getConversationKey(userId, otherUserId, itemId)
    
    if (!conversations.value.has(key)) {
      conversations.value.set(key, {
        userId,
        otherUserId,
        itemId,
        messages: [],
        lastMessageTime: new Date(),
      })
      saveConversations()
    }
    
    return conversations.value.get(key)!
  }

  // Find transaction ID from itemId and two users
  // This is a helper that will be called from ActivityView/ChatModal
  async function findTransactionId(
    userId: string,
    otherUserId: string,
    itemId: string
  ): Promise<string | null> {
    try {
      // Import transaction store to find matching transaction
      const { useTransactionStore } = await import('@/stores/transactionStore')
      const transactionStore = useTransactionStore()
      
      // Find transaction where both users are involved and item matches
      const transaction = transactionStore.transactions.find(
        (tx) =>
          tx.item === itemId &&
          ((tx.from === userId && tx.to === otherUserId) ||
            (tx.from === otherUserId && tx.to === userId))
      )
      
      return transaction?._id || null
    } catch (err) {
      console.error('Failed to find transaction ID:', err)
      return null
    }
  }

  // Ensure backend conversation exists and is linked to local conversation
  async function ensureBackendConversation(
    userId: string,
    otherUserId: string,
    itemId: string,
    transactionId: string | null
  ): Promise<string | null> {
    const conversation = getConversation(userId, otherUserId, itemId)
    
    // If we already have a backend conversation ID, return it
    if (conversation.backendConversationId) {
      return conversation.backendConversationId
    }

    // If we don't have a transaction ID, try to find it
    if (!transactionId) {
      transactionId = await findTransactionId(userId, otherUserId, itemId)
    }

    // If still no transaction ID, we can't create a backend conversation
    if (!transactionId) {
      console.warn('No transaction ID found, cannot create backend conversation')
      return null
    }

    try {
      // Try to get existing conversation by transaction
      const existingConv = await communicationAPI.getConversationByTransaction({
        transaction: transactionId,
      })

      if (existingConv) {
        conversation.backendConversationId = existingConv._id
        conversation.transactionId = transactionId
        saveConversations()
        return existingConv._id
      }

      // Create new conversation
      const response = await communicationAPI.createConversation({
        participant1: userId,
        participant2: otherUserId,
        transaction: transactionId,
      })

      conversation.backendConversationId = response.conversation
      conversation.transactionId = transactionId
      saveConversations()
      return response.conversation
    } catch (err) {
      console.error('Failed to ensure backend conversation:', err)
      return null
    }
  }

  // Fetch messages from backend and merge with local
  async function fetchMessagesFromBackend(
    conversationId: string,
    userId: string,
    otherUserId: string,
    itemId: string
  ): Promise<void> {
    try {
      const backendMessages = await communicationAPI.getMessages({
        conversation: conversationId,
      })

      const conversation = getConversation(userId, otherUserId, itemId)
      
      // Merge backend messages with local messages
      // Use a Set to track which message IDs we've seen
      const existingIds = new Set(conversation.messages.map((m) => m.backendId || m.id))

      for (const backendMsg of backendMessages) {
        // Skip if we already have this message
        if (existingIds.has(backendMsg._id)) continue

        // Convert backend message to local format
        const message: Message = {
          id: backendMsg._id,
          backendId: backendMsg._id,
          fromUserId: backendMsg.author,
          toUserId: backendMsg.author === userId ? otherUserId : userId,
          content: backendMsg.content,
          timestamp: new Date(backendMsg.createdAt),
          read: backendMsg.readAt !== null,
        }

        conversation.messages.push(message)
        existingIds.add(backendMsg._id)
      }

      // Sort messages by timestamp
      conversation.messages.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      )

      // Update last message time
      if (conversation.messages.length > 0) {
        const lastMsg = conversation.messages[conversation.messages.length - 1]
        conversation.lastMessageTime = lastMsg.timestamp
      }

      saveConversations()
    } catch (err) {
      console.error('Failed to fetch messages from backend:', err)
    }
  }

  // Get all conversations for a user
  const getUserConversations = computed(() => {
    return (userId: string) => {
      const userConvs: Conversation[] = []
      conversations.value.forEach((conv) => {
        if (conv.userId === userId || conv.otherUserId === userId) {
          userConvs.push(conv)
        }
      })
      return userConvs.sort(
        (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
      )
    }
  })

  // Send a message (async, sends to backend)
  async function sendMessage(
    fromUserId: string,
    toUserId: string,
    itemId: string,
    content: string,
    transactionId?: string | null
  ): Promise<Message> {
    const conversation = getConversation(fromUserId, toUserId, itemId)
    
    // Ensure backend conversation exists
    const backendConvId = await ensureBackendConversation(
      fromUserId,
      toUserId,
      itemId,
      transactionId || null
    )

    // Create local message immediately for optimistic UI update
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const message: Message = {
      id: tempId,
      fromUserId,
      toUserId,
      content: content.trim(),
      timestamp: new Date(),
      read: false,
    }

    conversation.messages.push(message)
    conversation.lastMessageTime = new Date()
    saveConversations()

    // Send to backend if we have a conversation ID
    if (backendConvId) {
      try {
        const response = await communicationAPI.sendMessage({
          conversation: backendConvId,
          author: fromUserId,
          content: content.trim(),
        })

        // Update message with backend ID
        message.id = response.message
        message.backendId = response.message
        saveConversations()

        // Refresh messages from backend to ensure sync
        await fetchMessagesFromBackend(backendConvId, fromUserId, toUserId, itemId)
      } catch (err) {
        console.error('Failed to send message to backend:', err)
        // Keep the local message even if backend send fails
        // User can retry or it will sync later
      }
    } else {
      console.warn('No backend conversation ID, message saved locally only')
    }

    return message
  }

  // Mark messages as read (syncs with backend)
  async function markAsRead(userId: string, otherUserId: string, itemId: string) {
    const conversation = getConversation(userId, otherUserId, itemId)
    
    // Mark locally
    const unreadMessages = conversation.messages.filter(
      (msg) => msg.toUserId === userId && !msg.read
    )
    
    unreadMessages.forEach((msg) => {
      msg.read = true
    })
    saveConversations()

    // Mark on backend if we have a conversation ID
    if (conversation.backendConversationId) {
      try {
        await communicationAPI.markConversationRead({
          conversation: conversation.backendConversationId,
          user: userId,
        })
      } catch (err) {
        console.error('Failed to mark conversation as read on backend:', err)
      }
    }
  }

  // Get unread count for a user
  const getUnreadCount = computed(() => {
    return (userId: string) => {
      let count = 0
      conversations.value.forEach((conv) => {
        if (conv.userId === userId || conv.otherUserId === userId) {
          count += conv.messages.filter(
            (msg) => msg.toUserId === userId && !msg.read
          ).length
        }
      })
      return count
    }
  })

  // Get unread count for a specific conversation
  function getConversationUnreadCount(
    userId: string,
    otherUserId: string,
    itemId: string
  ): number {
    const conversation = getConversation(userId, otherUserId, itemId)
    return conversation.messages.filter(
      (msg) => msg.toUserId === userId && !msg.read
    ).length
  }

  // Handle SSE message updates from backend
  async function handleMessage(backendMessage: BackendMessage) {
    console.log('Backend message received:', backendMessage)
    
    // Show notification for new message (lazy import to avoid circular dependencies)
    try {
      const { useNotificationStore } = await import('@/stores/notificationStore')
      const notificationStore = useNotificationStore()
      notificationStore.showMessageNotification(backendMessage)
    } catch (err) {
      console.error('Failed to show message notification:', err)
    }

    // Get conversation details to find participants and transaction
    try {
      const backendConv = await communicationAPI.getConversation({
        conversation: backendMessage.conversation,
      })

      if (!backendConv) {
        console.warn('Conversation not found for message:', backendMessage._id)
        return
      }

      // Get current user ID from auth store
      const { useAuthStore } = await import('@/stores/authStore')
      const authStore = useAuthStore()
      const currentUserId = authStore.userId

      if (!currentUserId) {
        console.warn('No current user ID, cannot process message')
        return
      }

      // Determine other user ID
      const otherUserId =
        backendConv.participant1 === currentUserId
          ? backendConv.participant2
          : backendConv.participant1

      // Get transaction to find item ID
      const { useTransactionStore } = await import('@/stores/transactionStore')
      const transactionStore = useTransactionStore()
      const transaction = transactionStore.transactions.find(
        (tx) => tx._id === backendConv.transaction
      )

      if (!transaction) {
        console.warn('Transaction not found for conversation:', backendConv._id)
        return
      }

      const itemId = transaction.item

      // Get or create local conversation
      const conversation = getConversation(currentUserId, otherUserId, itemId)
      
      // Link backend conversation if not already linked
      if (!conversation.backendConversationId) {
        conversation.backendConversationId = backendConv._id
        conversation.transactionId = backendConv.transaction
      }

      // Check if message already exists
      const existingMessage = conversation.messages.find(
        (msg) => msg.backendId === backendMessage._id || msg.id === backendMessage._id
      )

      if (existingMessage) {
        // Update existing message
        existingMessage.read = backendMessage.readAt !== null
        existingMessage.backendId = backendMessage._id
        saveConversations()
        return
      }

      // Add new message
      const message: Message = {
        id: backendMessage._id,
        backendId: backendMessage._id,
        fromUserId: backendMessage.author,
        toUserId: currentUserId,
        content: backendMessage.content,
        timestamp: new Date(backendMessage.createdAt),
        read: backendMessage.readAt !== null,
      }

      conversation.messages.push(message)
      conversation.lastMessageTime = new Date(backendMessage.createdAt)

      // Sort messages by timestamp
      conversation.messages.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      )

      saveConversations()
    } catch (err) {
      console.error('Failed to handle backend message:', err)
    }
  }

  // Load conversation from backend (call this when opening chat modal)
  async function loadConversationFromBackend(
    userId: string,
    otherUserId: string,
    itemId: string,
    transactionId?: string | null
  ): Promise<void> {
    // Ensure backend conversation exists
    const backendConvId = await ensureBackendConversation(
      userId,
      otherUserId,
      itemId,
      transactionId || null
    )

    if (backendConvId) {
      // Fetch and merge messages from backend
      await fetchMessagesFromBackend(backendConvId, userId, otherUserId, itemId)
    }
  }

  return {
    conversations,
    loadConversations,
    getConversation,
    getUserConversations,
    sendMessage,
    markAsRead,
    getUnreadCount,
    getConversationUnreadCount,
    handleMessage,
    loadConversationFromBackend,
    findTransactionId,
  }
})

