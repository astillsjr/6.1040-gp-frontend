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
      console.log('🔍 findTransactionId called', { userId, otherUserId, itemId })
      
      // Import transaction store to find matching transaction
      const { useTransactionStore } = await import('@/stores/transactionStore')
      const transactionStore = useTransactionStore()
      
      console.log('📊 Transaction store state:', {
        transactionCount: transactionStore.transactions.length,
        transactions: transactionStore.transactions.map(tx => ({
          id: tx._id,
          item: tx.item,
          from: tx.from,
          to: tx.to,
          status: tx.status
        }))
      })
      
      // Find transaction where both users are involved and item matches
      const transaction = transactionStore.transactions.find(
        (tx) =>
          tx.item === itemId &&
          ((tx.from === userId && tx.to === otherUserId) ||
            (tx.from === otherUserId && tx.to === userId))
      )
      
      if (transaction) {
        console.log('✅ Found transaction:', transaction._id)
      } else {
        console.warn('⚠️ No matching transaction found', {
          itemId,
          userId,
          otherUserId,
          searchedTransactions: transactionStore.transactions.length
        })
      }
      
      return transaction?._id || null
    } catch (err) {
      console.error('❌ Failed to find transaction ID:', err)
      return null
    }
  }

  // Ensure backend conversation exists and is linked to local conversation
  // NOTE: Backend automatically creates conversations when transactions are created via syncs.
  // This function queries for existing conversations and only creates manually as a last resort.
  async function ensureBackendConversation(
    userId: string,
    otherUserId: string,
    itemId: string,
    transactionId: string | null
  ): Promise<string | null> {
    console.log('🔍 ensureBackendConversation called', {
      userId,
      otherUserId,
      itemId,
      transactionId
    })
    
    const conversation = getConversation(userId, otherUserId, itemId)
    
    // If we already have a backend conversation ID, return it
    if (conversation.backendConversationId) {
      console.log('✅ Already have backend conversation ID:', conversation.backendConversationId)
      return conversation.backendConversationId
    }

    // If we don't have a transaction ID, try to find it
    if (!transactionId) {
      console.log('🔍 No transaction ID provided, searching...')
      transactionId = await findTransactionId(userId, otherUserId, itemId)
      console.log('🔍 Found transaction ID:', transactionId)
    }

    // If still no transaction ID, we can't query for or create a backend conversation
    if (!transactionId) {
      console.warn('⚠️ No transaction ID found, cannot find backend conversation')
      return null
    }

    try {
      // Query for existing conversations - backend should have created it automatically
      console.log('🔍 Querying for existing conversations...')
      const conversations = await communicationAPI.getConversationsByUser({
        user: userId,
      })
      
      // Find conversation for this transaction
      const existingConv = conversations.find(c => c.transaction === transactionId)
      console.log('🔍 Found conversation for transaction:', existingConv ? existingConv._id : 'none')

      if (existingConv) {
        // Link the conversation to our local conversation
        conversation.backendConversationId = existingConv._id
        conversation.transactionId = transactionId
        saveConversations()
        console.log('✅ Using existing conversation:', existingConv._id)
        return existingConv._id
      }

      // Only create manually as a last resort (should be rare - backend creates automatically)
      console.warn('⚠️ Conversation missing for transaction, creating manually (this should be rare)')
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        console.error('❌ No access token available for creating conversation')
        return null
      }

      const response = await communicationAPI.createConversation({
        participant1: userId,
        participant2: otherUserId,
        transaction: transactionId,
        accessToken,
      })
      console.log('✅ Created conversation manually:', response.conversation)

      conversation.backendConversationId = response.conversation
      conversation.transactionId = transactionId
      saveConversations()
      return response.conversation
    } catch (err) {
      console.error('❌ Failed to ensure backend conversation:', err)
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
    console.log('📤 sendMessage called in store', {
      fromUserId,
      toUserId,
      itemId,
      contentLength: content.length,
      transactionId
    })
    
    const conversation = getConversation(fromUserId, toUserId, itemId)
    console.log('📋 Got conversation:', {
      hasBackendId: !!conversation.backendConversationId,
      backendId: conversation.backendConversationId,
      messageCount: conversation.messages.length
    })
    
    // Ensure backend conversation exists
    console.log('🔄 Ensuring backend conversation...')
    const backendConvId = await ensureBackendConversation(
      fromUserId,
      toUserId,
      itemId,
      transactionId || null
    )
    console.log('🔄 Backend conversation ID:', backendConvId)

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
    console.log('💾 Saved local message')

    // Send to backend if we have a conversation ID
    if (backendConvId) {
      console.log('🌐 Sending to backend API...')
      try {
        // Get accessToken from localStorage for authentication
        const accessToken = localStorage.getItem('accessToken')
        if (!accessToken) {
          throw new Error('No access token available')
        }

        const response = await communicationAPI.sendMessage({
          conversation: backendConvId,
          content: content.trim(),
          accessToken,
        })
        console.log('✅ Backend response:', response)

        // Update message with backend ID
        message.id = response.message
        message.backendId = response.message
        saveConversations()

        // Refresh messages from backend to ensure sync
        await fetchMessagesFromBackend(backendConvId, fromUserId, toUserId, itemId)
      } catch (err) {
        console.error('❌ Failed to send message to backend:', err)
        // Keep the local message even if backend send fails
        // User can retry or it will sync later
      }
    } else {
      console.warn('⚠️ No backend conversation ID, message saved locally only', {
        userId: fromUserId,
        otherUserId: toUserId,
        itemId: itemId,
        transactionId: transactionId
      })
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
        // Get accessToken from localStorage for authentication
        const accessToken = localStorage.getItem('accessToken')
        if (!accessToken) {
          console.warn('No access token available for marking conversation as read')
          return
        }

        await communicationAPI.markConversationRead({
          conversation: conversation.backendConversationId,
          accessToken,
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

