// Pinia store for Message management
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Message {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  timestamp: Date
  read: boolean
}

export interface Conversation {
  userId: string
  otherUserId: string
  itemId: string
  messages: Message[]
  lastMessageTime: Date
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

  // Get or create a conversation
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

  // Send a message
  function sendMessage(
    fromUserId: string,
    toUserId: string,
    itemId: string,
    content: string
  ): Message {
    const conversation = getConversation(fromUserId, toUserId, itemId)
    
    const message: Message = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId,
      toUserId,
      content: content.trim(),
      timestamp: new Date(),
      read: false,
    }

    conversation.messages.push(message)
    conversation.lastMessageTime = new Date()
    saveConversations()

    return message
  }

  // Mark messages as read
  function markAsRead(userId: string, otherUserId: string, itemId: string) {
    const conversation = getConversation(userId, otherUserId, itemId)
    conversation.messages.forEach((msg) => {
      if (msg.toUserId === userId) {
        msg.read = true
      }
    })
    saveConversations()
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
  // Backend message format: { _id, conversation, author, content, createdAt, readAt }
  // Note: This assumes the backend message system might be different from local storage
  // For now, we'll show a notification. You may need to fetch conversation details
  // to properly integrate with the local message store format
  function handleMessage(backendMessage: any) {
    console.log('Backend message received:', backendMessage)
    
    // Show notification for new message
    // The notification store will handle displaying it
    import('@/stores/notificationStore').then(({ useNotificationStore }) => {
      const notificationStore = useNotificationStore()
      notificationStore.showMessageNotification(backendMessage)
    })

    // TODO: If you have an API to fetch conversation details (itemId, participants),
    // you could integrate it into the local message store like this:
    // 
    // fetchConversationDetails(backendMessage.conversation)
    //   .then((details) => {
    //     const currentUserId = getCurrentUserId() // from authStore
    //     const otherUserId = details.participants.find(id => id !== currentUserId)
    //     const message: Message = {
    //       id: backendMessage._id,
    //       fromUserId: backendMessage.author,
    //       toUserId: currentUserId,
    //       content: backendMessage.content,
    //       timestamp: new Date(backendMessage.createdAt),
    //       read: backendMessage.readAt !== null,
    //     }
    //     const conversation = getConversation(currentUserId, otherUserId, details.itemId)
    //     conversation.messages.push(message)
    //     conversation.lastMessageTime = new Date(backendMessage.createdAt)
    //     saveConversations()
    //   })
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
  }
})

