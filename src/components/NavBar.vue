<template>
  <nav 
    class="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-md shadow-sm z-[1000] h-[72px] border-b border-border"
    role="navigation"
    aria-label="Main navigation"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
      <!-- Logo -->
      <router-link 
        to="/" 
        class="text-foreground hover:opacity-80 transition-opacity no-underline group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        aria-label="LocalLoop Home"
      >
        <h1 class="text-2xl font-bold tracking-tight">
          <span class="text-primary">LocalLoop</span>
        </h1>
      </router-link>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-1 lg:gap-2">
        <router-link 
          to="/items" 
          class="text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm px-4 py-2 rounded-lg no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          active-class="bg-primary/10 text-primary font-semibold"
          aria-label="Browse Items"
        >
          Browse
        </router-link>
        
        <!-- Authenticated User Navigation -->
        <template v-if="authStore.isAuthenticated">
          <router-link 
            to="/items/new" 
            class="text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm px-4 py-2 rounded-lg no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            active-class="bg-primary/10 text-primary font-semibold"
            aria-label="List New Item"
          >
            List Item
          </router-link>
          <router-link 
            to="/activity" 
            class="text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm px-4 py-2 rounded-lg no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            active-class="bg-primary/10 text-primary font-semibold"
            aria-label="View Activity"
          >
            Activity
          </router-link>
          
          <!-- Notifications Bell Icon -->
          <div class="relative" ref="notificationMenuRef">
            <button
              @click="toggleNotificationMenu"
              @keydown.escape="closeNotificationMenu"
              class="relative flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              :class="{ 'bg-primary/10 text-primary': isNotificationMenuOpen }"
              aria-label="Notifications"
              aria-expanded="false"
              :aria-expanded="isNotificationMenuOpen"
            >
              <Bell class="w-5 h-5" />
              <span
                v-if="notificationStore.unreadCount > 0"
                class="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full"
              >
                {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
              </span>
            </button>
            
            <!-- Notification Dropdown -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="isNotificationMenuOpen"
                class="absolute right-0 mt-2 w-80 sm:w-96 rounded-md bg-popover border border-border shadow-lg z-50 focus:outline-none max-h-[500px] flex flex-col"
                role="menu"
                aria-orientation="vertical"
              >
                <!-- Header -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 class="text-sm font-semibold text-foreground">Notifications</h3>
                  <button
                    v-if="notificationStore.unreadCount > 0"
                    @click="markAllAsRead"
                    class="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
                
                <!-- Notifications List -->
                <div class="overflow-y-auto max-h-[400px]">
                  <div v-if="notificationStore.allNotifications.length === 0" class="px-4 py-8 text-center">
                    <Bell class="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p class="text-sm text-muted-foreground">No notifications</p>
                  </div>
                  <div v-else class="divide-y divide-border">
                    <button
                      v-for="notification in notificationStore.allNotifications"
                      :key="notification.notificationId"
                      @click="handleNotificationClick(notification)"
                      class="w-full text-left px-4 py-3 hover:bg-accent transition-colors focus:outline-none focus:bg-accent"
                      :class="{ 'bg-accent/50': !notification.read }"
                      role="menuitem"
                    >
                      <div class="flex items-start gap-3">
                        <!-- Icon/Avatar -->
                        <div class="shrink-0">
                          <div
                            v-if="notification.userAvatar"
                            class="w-10 h-10 rounded-full overflow-hidden border-2 border-border bg-muted"
                          >
                            <img
                              :src="notification.userAvatar"
                              :alt="notification.userName || 'User'"
                              class="w-full h-full object-cover"
                            />
                          </div>
                          <div
                            v-else
                            class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-border"
                            :class="{
                              'bg-green-100 text-green-600': notification.type === 'request_accepted',
                              'bg-blue-100 text-blue-600': notification.type === 'transaction_created',
                              'bg-purple-100 text-purple-600': notification.type === 'message',
                              'bg-gray-100 text-gray-600': notification.type === 'notification',
                            }"
                          >
                            <CheckCircle2
                              v-if="notification.type === 'request_accepted'"
                              class="w-5 h-5"
                            />
                            <User
                              v-else-if="notification.type === 'transaction_created'"
                              class="w-5 h-5"
                            />
                            <MessageCircle
                              v-else-if="notification.type === 'message'"
                              class="w-5 h-5"
                            />
                            <Bell
                              v-else
                              class="w-5 h-5"
                            />
                          </div>
                        </div>
                        
                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <p class="text-sm font-semibold text-foreground">{{ notification.title }}</p>
                            <span
                              v-if="!notification.read"
                              class="w-2 h-2 rounded-full bg-primary shrink-0"
                              aria-label="Unread"
                            ></span>
                          </div>
                          <p class="text-xs text-muted-foreground line-clamp-2 mb-1">{{ notification.message }}</p>
                          <div class="flex items-center gap-2">
                            <p class="text-xs text-muted-foreground">{{ formatTime(notification.timestamp) }}</p>
                            <span
                              v-if="notification.transactionType"
                              class="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                            >
                              {{ notification.transactionType }}
                            </span>
                          </div>
                        </div>
                        
                        <!-- Dismiss Button -->
                        <button
                          @click.stop="dismissNotification(notification.notificationId)"
                          class="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1"
                          aria-label="Dismiss notification"
                        >
                          <X class="w-4 h-4" />
                        </button>
                      </div>
                    </button>
                  </div>
                </div>
                
                <!-- Footer -->
                <div v-if="notificationStore.allNotifications.length > 0" class="px-4 py-2 border-t border-border">
                  <button
                    @click="clearAllNotifications"
                    class="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1 transition-colors"
                  >
                    Clear all notifications
                  </button>
                </div>
              </div>
            </transition>
          </div>
          
          <!-- User Dropdown Menu -->
          <div class="relative" ref="userMenuRef">
            <button
              @click="toggleUserMenu"
              @keydown.escape="closeUserMenu"
              @keydown.enter="toggleUserMenu"
              class="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm px-4 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              :class="{ 'bg-primary/10 text-primary font-semibold': isUserMenuOpen }"
              aria-label="User menu"
              aria-expanded="false"
              aria-haspopup="true"
              :aria-expanded="isUserMenuOpen"
            >
              <span>{{ authStore.username }}</span>
              <svg 
                class="w-4 h-4 transition-transform" 
                :class="{ 'rotate-180': isUserMenuOpen }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 mt-2 w-48 rounded-md bg-popover border border-border shadow-lg py-1 z-50 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
              >
                <!-- SSE Status in Menu -->
                <div 
                  class="px-4 py-2 text-xs border-b border-border"
                  :class="authStore.isSSEConnected 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-muted-foreground'"
                >
                  <div class="flex items-center gap-2">
                    <span 
                      class="w-2 h-2 rounded-full" 
                      :class="authStore.isSSEConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"
                      aria-hidden="true"
                    ></span>
                    <span>{{ authStore.isSSEConnected ? 'Real-time updates active' : 'Real-time updates offline' }}</span>
                  </div>
                </div>
                
                <router-link
                  to="/profile"
                  @click="closeUserMenu"
                  class="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors focus:outline-none focus:bg-accent"
                  role="menuitem"
                  aria-label="View Profile"
                >
                  Profile
                </router-link>
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors focus:outline-none focus:bg-accent"
                  role="menuitem"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            </transition>
          </div>
        </template>
        
        <!-- Guest Navigation -->
        <template v-else>
          <router-link 
            to="/register" 
            class="inline-flex items-center gap-2 text-primary-foreground bg-primary hover:bg-primary/90 border border-primary font-semibold transition-all text-sm px-4 py-2 rounded-lg no-underline shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Get Started"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Get Started
          </router-link>
          <router-link 
            to="/login" 
            class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent border border-border bg-transparent font-medium transition-all text-sm px-4 py-2 rounded-lg no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            active-class="bg-primary/10 text-primary font-semibold border-primary/20"
            aria-label="Login"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </router-link>
        </template>
      </div>
      
      <!-- Mobile Menu Button -->
      <button
        @click="toggleMobileMenu"
        @keydown.escape="closeMobileMenu"
        class="md:hidden p-2 rounded-lg text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Toggle mobile menu"
        aria-expanded="false"
        :aria-expanded="isMobileMenuOpen"
      >
        <svg 
          v-if="!isMobileMenuOpen"
          class="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg 
          v-else
          class="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Mobile Menu -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 -translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 -translate-y-2"
    >
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden border-t border-border bg-card/98 backdrop-blur-md shadow-lg"
        role="menu"
      >
        <div class="px-4 py-3 space-y-1">
          <router-link
            to="/items"
            @click="closeMobileMenu"
            class="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm rounded-lg no-underline focus:outline-none focus:bg-accent"
            active-class="bg-primary/10 text-primary font-semibold"
            role="menuitem"
            aria-label="Browse Items"
          >
            Browse
          </router-link>
          
          <template v-if="authStore.isAuthenticated">
            <!-- SSE Status in Mobile Menu -->
            <div 
              class="px-4 py-2 text-xs rounded-lg"
              :class="authStore.isSSEConnected 
                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30' 
                : 'text-muted-foreground bg-muted/50'"
            >
              <div class="flex items-center gap-2">
                <span 
                  class="w-2 h-2 rounded-full" 
                  :class="authStore.isSSEConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"
                  aria-hidden="true"
                ></span>
                <span>{{ authStore.isSSEConnected ? 'Real-time updates active' : 'Real-time updates offline' }}</span>
              </div>
            </div>
            
            <!-- Notifications in Mobile Menu -->
            <button
              @click="() => { closeMobileMenu(); toggleNotificationMenu(); }"
              class="relative w-full flex items-center justify-between px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm rounded-lg focus:outline-none focus:bg-accent"
              aria-label="Notifications"
            >
              <div class="flex items-center gap-2">
                <Bell class="w-4 h-4" />
                <span>Notifications</span>
              </div>
              <span
                v-if="notificationStore.unreadCount > 0"
                class="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-primary-foreground bg-primary rounded-full"
              >
                {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
              </span>
            </button>
            
            <router-link
              to="/items/new"
              @click="closeMobileMenu"
              class="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm rounded-lg no-underline focus:outline-none focus:bg-accent"
              active-class="bg-primary/10 text-primary font-semibold"
              role="menuitem"
              aria-label="List New Item"
            >
              List Item
            </router-link>
            <router-link
              to="/activity"
              @click="closeMobileMenu"
              class="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm rounded-lg no-underline focus:outline-none focus:bg-accent"
              active-class="bg-primary/10 text-primary font-semibold"
              role="menuitem"
              aria-label="View Activity"
            >
              Activity
            </router-link>
            <router-link
              to="/profile"
              @click="closeMobileMenu"
              class="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm rounded-lg no-underline focus:outline-none focus:bg-accent"
              active-class="bg-primary/10 text-primary font-semibold"
              role="menuitem"
              aria-label="View Profile"
            >
              Profile ({{ authStore.username }})
            </router-link>
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm rounded-lg focus:outline-none focus:bg-accent"
              role="menuitem"
              aria-label="Logout"
            >
              Logout
            </button>
          </template>
          
          <template v-else>
            <router-link
              to="/register"
              @click="closeMobileMenu"
              class="flex items-center gap-2 px-4 py-2 text-primary-foreground bg-primary hover:bg-primary/90 font-semibold transition-all text-sm rounded-lg no-underline shadow-md focus:outline-none focus:bg-primary/90"
              role="menuitem"
              aria-label="Get Started"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Get Started
            </router-link>
            <router-link
              to="/login"
              @click="closeMobileMenu"
              class="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent border border-border bg-transparent font-medium transition-all text-sm rounded-lg no-underline focus:outline-none focus:bg-accent"
              active-class="bg-primary/10 text-primary font-semibold border-primary/20"
              role="menuitem"
              aria-label="Login"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </router-link>
          </template>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { Bell, X, CheckCircle2, User, MessageCircle } from 'lucide-vue-next'
import type { ActiveNotification } from '@/stores/notificationStore'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// Notification menu state
const isNotificationMenuOpen = ref(false)
const notificationMenuRef = ref<HTMLElement | null>(null)
const toggleNotificationMenu = () => {
  isNotificationMenuOpen.value = !isNotificationMenuOpen.value
  // Close other menus when opening notification menu
  if (isNotificationMenuOpen.value) {
    isUserMenuOpen.value = false
    isMobileMenuOpen.value = false
  }
}
const closeNotificationMenu = () => {
  isNotificationMenuOpen.value = false
}

// Mobile menu state
const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // Close user menu when opening mobile menu
  if (isMobileMenuOpen.value) {
    isUserMenuOpen.value = false
  }
}
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// User dropdown menu state
const isUserMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
  // Close mobile menu when opening user menu
  if (isUserMenuOpen.value) {
    isMobileMenuOpen.value = false
  }
}
const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

// Close menus when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false
  }
  if (notificationMenuRef.value && !notificationMenuRef.value.contains(event.target as Node)) {
    isNotificationMenuOpen.value = false
  }
}

// Close mobile menu on route change
router.afterEach(() => {
  closeMobileMenu()
  closeUserMenu()
  closeNotificationMenu()
})

// Notification handlers
function handleNotificationClick(notification: ActiveNotification) {
  // Mark as read
  notificationStore.markAsRead(notification.notificationId)
  closeNotificationMenu()
  
  // Navigate based on notification type
  if (notification.itemId) {
    router.push(`/items/${notification.itemId}`)
  } else if (notification.requestId || notification.transactionId) {
    router.push('/activity')
  } else if (notification.conversationId) {
    router.push('/activity')
  }
}

function dismissNotification(notificationId: string) {
  notificationStore.dismissNotification(notificationId)
}

function markAllAsRead() {
  notificationStore.markAllAsRead()
}

function clearAllNotifications() {
  notificationStore.clearAllNotifications()
  closeNotificationMenu()
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

const handleLogout = async () => {
  closeMobileMenu()
  closeUserMenu()
  await authStore.logout()
  router.push('/')
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
