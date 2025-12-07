<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="close"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-2xl">
        <div class="flex items-center gap-3">
          <img
            :src="otherUserAvatar"
            :alt="otherUserName"
            class="w-10 h-10 rounded-full border-2 border-blue-300"
          />
          <div>
            <h3 class="font-semibold text-gray-900">{{ otherUserName }}</h3>
            <p class="text-sm text-gray-600">{{ otherUserDorm }}</p>
          </div>
        </div>
        <button
          @click="close"
          class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Item Info -->
      <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md overflow-hidden">
            <ImageWithFallback
              :src="itemImage || `https://via.placeholder.com/150?text=${encodeURIComponent(itemTitle)}`"
              :alt="itemTitle"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ itemTitle }}</p>
            <p class="text-xs text-gray-500">About this item</p>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex',
            message.fromUserId === currentUserId ? 'justify-end' : 'justify-start',
          ]"
        >
          <div
            :class="[
              'max-w-[75%] rounded-2xl px-4 py-2',
              message.fromUserId === currentUserId
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-900 border border-gray-200',
            ]"
          >
            <p class="text-sm whitespace-pre-wrap break-words">{{ message.content }}</p>
            <p
              :class="[
                'text-xs mt-1',
                message.fromUserId === currentUserId
                  ? 'text-blue-100'
                  : 'text-gray-500',
              ]"
            >
              {{ formatTime(message.timestamp) }}
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="messages.length === 0"
          class="text-center py-12 text-gray-500"
        >
          <MessageCircle class="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p class="text-sm">No messages yet. Start the conversation!</p>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <form @submit.prevent="handleSendMessage" class="flex gap-2">
          <Textarea
            v-model="messageInput"
            placeholder="Type a message..."
            rows="2"
            class="flex-1 rounded-xl border-2 focus:border-blue-500 resize-none"
            @keydown.enter.exact.prevent="handleSendMessage"
            @keydown.enter.shift.exact="messageInput += '\n'"
          />
          <Button
            type="submit"
            :disabled="!messageInput.trim() || isSending"
            class="rounded-xl px-6"
          >
            <Send class="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useMessageStore } from '@/stores/messageStore'
import { useAuthStore } from '@/stores/authStore'
import { Button, Textarea } from '@/components/ui'
import { X, Send, MessageCircle } from 'lucide-vue-next'
import ImageWithFallback from '@/components/ImageWithFallback.vue'
import * as userProfileAPI from '@/api/userProfile'

interface Props {
  isOpen: boolean
  otherUserId: string
  otherUserProfile: userProfileAPI.UserProfile | null
  itemId: string
  itemTitle: string
  itemImage: string | null
  transactionId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const messageStore = useMessageStore()
const authStore = useAuthStore()

const currentUserId = computed(() => authStore.userId || '')
const messageInput = ref('')
const isSending = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const otherUserName = computed(() => 
  props.otherUserProfile?.displayName || `User ${props.otherUserId.slice(0, 8)}...`
)

const otherUserDorm = computed(() => 
  props.otherUserProfile?.dorm || 'No dorm set'
)

const otherUserAvatar = computed(() => {
  const name = props.otherUserProfile?.displayName || props.otherUserId || 'User'
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
})

const conversation = computed(() => {
  if (!currentUserId.value) return null
  return messageStore.getConversation(
    currentUserId.value,
    props.otherUserId,
    props.itemId
  )
})

const messages = computed(() => {
  return conversation.value?.messages || []
})

// Scroll to bottom when messages change
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// Scroll to bottom when modal opens and load conversation from backend
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && currentUserId.value) {
    // Load conversation from backend
    try {
      await messageStore.loadConversationFromBackend(
        currentUserId.value,
        props.otherUserId,
        props.itemId,
        props.transactionId || null
      )
    } catch (err) {
      console.error('Failed to load conversation from backend:', err)
    }
    
    nextTick(() => {
      scrollToBottom()
      // Mark messages as read when opening
      messageStore.markAsRead(
        currentUserId.value,
        props.otherUserId,
        props.itemId
      )
    })
  }
})

// Watch for new messages from SSE and add them to the conversation
// The messageStore.handleMessage() is called by SSE, but we need to integrate
// backend messages into the local conversation format
watch(
  () => messageStore.conversations,
  () => {
    // When conversations update (from SSE or local), scroll to bottom
    nextTick(() => {
      scrollToBottom()
    })
  },
  { deep: true }
)

onMounted(() => {
  if (props.isOpen) {
    scrollToBottom()
  }
})

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatTime(date: Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

async function handleSendMessage() {
  console.log('🔵 handleSendMessage called', {
    hasInput: !!messageInput.value.trim(),
    currentUserId: currentUserId.value,
    isSending: isSending.value,
    otherUserId: props.otherUserId,
    itemId: props.itemId,
    transactionId: props.transactionId
  })
  
  if (!messageInput.value.trim() || !currentUserId.value || isSending.value) {
    console.log('❌ Early return from handleSendMessage')
    return
  }

  isSending.value = true
  console.log('✅ Starting sendMessage call')
  
  try {
    const result = await messageStore.sendMessage(
      currentUserId.value,
      props.otherUserId,
      props.itemId,
      messageInput.value,
      props.transactionId || null
    )
    console.log('✅ sendMessage completed:', result)
    messageInput.value = ''
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('❌ Failed to send message:', err)
    alert('Failed to send message. Please try again.')
  } finally {
    isSending.value = false
  }
}

function close() {
  emit('close')
}
</script>

