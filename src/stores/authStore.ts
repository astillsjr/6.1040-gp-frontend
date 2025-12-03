// Pinia store for authentication
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import * as authAPI from '@/api/auth'
import { getUserIdFromToken, isTokenExpired } from '@/utils/jwt'
import type { AxiosError } from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const userId = ref<string | null>(null)
  const username = ref<string | null>(null)
  const email = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const sseConnection = ref<EventSource | null>(null)
  const isSSEConnected = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value)

  // Helper: Sync tokens and username to localStorage
  function syncTokensToStorage() {
    if (accessToken.value) {
      localStorage.setItem('accessToken', accessToken.value)
    } else {
      localStorage.removeItem('accessToken')
    }
    if (refreshToken.value) {
      localStorage.setItem('refreshToken', refreshToken.value)
    } else {
      localStorage.removeItem('refreshToken')
    }
    if (username.value) {
      localStorage.setItem('username', username.value)
    } else {
      localStorage.removeItem('username')
    }
  }

  // Helper: Update userId from token
  function updateUserIdFromToken() {
    userId.value = getUserIdFromToken(accessToken.value)
  }

  // Helper: Build SSE URL
  function buildSSEUrl(token: string): string {
    const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
    const isAbsoluteUrl = rawApiBaseUrl.startsWith('http://') || rawApiBaseUrl.startsWith('https://')
    
    // For SSE, we need the full URL
    if (isAbsoluteUrl) {
      const base = rawApiBaseUrl.endsWith('/') ? rawApiBaseUrl.slice(0, -1) : rawApiBaseUrl
      const baseWithoutApi = base.endsWith('/api') ? base.slice(0, -4) : base
      return `${baseWithoutApi}/api/events/stream?accessToken=${token}`
    } else {
      // Local development
      return `/api/events/stream?accessToken=${token}`
    }
  }

  // SSE Connection Management
  async function startSSEConnection() {
    if (!accessToken.value || sseConnection.value) {
      return
    }

    // Check if token is expired and refresh if needed before connecting
    if (isTokenExpired(accessToken.value)) {
      console.log('🔄 Token expired, refreshing before SSE connection...')
      const refreshed = await refreshAccessToken()
      if (!refreshed) {
        console.error('❌ Failed to refresh token, cannot start SSE connection')
        return
      }
      // refreshAccessToken already calls stopSSEConnection and startSSEConnection
      // so we can return here to avoid double connection
      return
    }

    try {
      const url = buildSSEUrl(accessToken.value)
      console.log('🔌 Starting SSE connection:', url)
      
      const eventSource = new EventSource(url)
      let hasHandledAuthError = false
      
      eventSource.addEventListener('connected', (event) => {
        const data = JSON.parse(event.data)
        console.log('✅ SSE connected:', data.message)
        isSSEConnected.value = true
        hasHandledAuthError = false // Reset on successful connection
      })

      eventSource.addEventListener('notification', async (event) => {
        const data = JSON.parse(event.data)
        console.log('📬 Notification received:', data)
        // Route to notification store (general notifications only)
        const { useNotificationStore } = await import('@/stores/notificationStore')
        const notificationStore = useNotificationStore()
        notificationStore.handleNotification(data.notification)
      })

      eventSource.addEventListener('request_update', async (event) => {
        const data = JSON.parse(event.data)
        console.log('📋 Request update received:', data)
        // Route to request store
        const { useRequestStore } = await import('@/stores/requestStore')
        const requestStore = useRequestStore()
        requestStore.handleRequestUpdate(data.request)
      })

      eventSource.addEventListener('transaction_update', async (event) => {
        const data = JSON.parse(event.data)
        console.log('💳 Transaction update received:', data)
        // Route to transaction store
        const { useTransactionStore } = await import('@/stores/transactionStore')
        const transactionStore = useTransactionStore()
        transactionStore.handleTransactionUpdate(data.transaction)
      })

      eventSource.addEventListener('message', async (event) => {
        const data = JSON.parse(event.data)
        console.log('💬 Message received:', data)
        // Route to message store
        const { useMessageStore } = await import('@/stores/messageStore')
        const messageStore = useMessageStore()
        messageStore.handleMessage(data.message)
      })

      eventSource.addEventListener('heartbeat', () => {
        // Connection is alive
        isSSEConnected.value = true
      })

      // Handle backend error events (custom events from backend)
      eventSource.addEventListener('error', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          console.error('❌ SSE error:', data.message)
          
          // Check if it's an authentication error
          const isAuthError = data.message?.toLowerCase().includes('token') || 
                             data.message?.toLowerCase().includes('expired') || 
                             data.message?.toLowerCase().includes('invalid') ||
                             data.message?.toLowerCase().includes('unauthorized')
          
          if (isAuthError && !hasHandledAuthError) {
            hasHandledAuthError = true
            console.log('🔄 Auth error detected, attempting token refresh...')
            // Close current connection
            stopSSEConnection()
            // Try to refresh token and reconnect
            refreshAccessToken().then((refreshed) => {
              if (refreshed) {
                console.log('✅ Token refreshed, will reconnect SSE')
                // refreshAccessToken already calls startSSEConnection
              } else {
                console.error('❌ Token refresh failed, SSE connection will not be established')
              }
            })
          }
        } catch {
          // Event might not have parseable data - this is normal for connection errors
          // Only log if we haven't handled an auth error
          if (!hasHandledAuthError) {
            console.error('❌ SSE error event (non-JSON):', event)
          }
        }
      })

      eventSource.onerror = (error) => {
        // Only log if we haven't already handled an auth error
        if (!hasHandledAuthError) {
          console.error('❌ EventSource connection error:', error)
        }
        isSSEConnected.value = false
        
        // Check if token might be expired and try refresh
        if (accessToken.value && isTokenExpired(accessToken.value) && !hasHandledAuthError) {
          hasHandledAuthError = true
          console.log('🔄 Token expired, attempting refresh...')
          stopSSEConnection()
          refreshAccessToken().then((refreshed) => {
            if (refreshed) {
              console.log('✅ Token refreshed, will reconnect SSE')
            }
          })
        } else if (!hasHandledAuthError) {
          // Only close if we haven't handled auth error
          stopSSEConnection()
        }
      }

      sseConnection.value = eventSource
    } catch (error) {
      console.error('❌ Failed to start SSE connection:', error)
    }
  }

  function stopSSEConnection() {
    if (sseConnection.value) {
      console.log('🔌 Stopping SSE connection')
      sseConnection.value.close()
      sseConnection.value = null
      isSSEConnected.value = false
    }
  }

  // Actions
  function initialize() {
    // Load tokens and username from localStorage
    const storedAccessToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedUsername = localStorage.getItem('username')

    if (storedAccessToken) {
      // Check if token is expired before using it
      if (isTokenExpired(storedAccessToken)) {
        console.log('⚠️ Stored token is expired, clearing...')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        // Don't set the token if it's expired
        return
      }
      accessToken.value = storedAccessToken
      updateUserIdFromToken()
    }
    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken
    }
    if (storedUsername) {
      username.value = storedUsername
    }
  }

  async function login(loginUsername: string, password: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      isLoading.value = true
      error.value = null

      const response = await authAPI.login({ username: loginUsername, password })
      accessToken.value = response.accessToken ?? null
      refreshToken.value = response.refreshToken ?? null
      // Store the username from the login form
      username.value = loginUsername
      syncTokensToStorage()
      updateUserIdFromToken()
      startSSEConnection()

      return { success: true }
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string; message?: string }>
      // Extract error message from backend response
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Invalid username or password. Please try again or create a new account.'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  async function register(
    registerUsername: string,
    password: string,
    email: string
  ): Promise<{
    success: boolean
    user?: string
    error?: string
  }> {
    try {
      isLoading.value = true
      error.value = null

      const response = await authAPI.register({ username: registerUsername, password, email })
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      // Store the username from the registration form (response.user is the userId, not username)
      username.value = registerUsername
      syncTokensToStorage()
      updateUserIdFromToken()
      startSSEConnection()

      return { success: true, user: response.user }
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string; message?: string }>
      let errorMessage = 'Registration failed. Please try again.'

      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        errorMessage =
          'Request timed out. This may happen if:\n1. Backend service is waking up (Render free tier can take 30+ seconds)\n2. Network connection issues\n3. Backend is not responding\n\nPlease wait a moment and try again.'
      } else if (axiosError.code === 'ERR_NETWORK' || !axiosError.response) {
        errorMessage =
          'Cannot connect to server. Please check:\n1. Backend is running\n2. VITE_API_BASE_URL is set correctly\n3. No CORS issues'
      } else if (axiosError.response?.status === 404) {
        errorMessage =
          'API endpoint not found. Please check your backend configuration.'
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        errorMessage = 'Server error. Please try again later.'
      } else {
        errorMessage =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          errorMessage
      }

      // Log full error for debugging
      console.error('Registration error:', {
        code: axiosError.code,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message,
      })

      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      isLoading.value = true
      error.value = null

      if (refreshToken.value) {
        await authAPI.logout({ refreshToken: refreshToken.value })
      }
    } catch (err) {
      console.error('Logout error:', err)
      // Continue with logout even if API call fails
    } finally {
      stopSSEConnection()
      clearAuth()
      isLoading.value = false
    }
  }

  async function refreshAccessToken(): Promise<boolean> {
    try {
      if (!refreshToken.value) {
        console.error('❌ No refresh token available')
        return false
      }

      console.log('🔄 Refreshing access token...')
      const response = await authAPI.refreshAccessToken({
        refreshToken: refreshToken.value,
      })
      accessToken.value = response.accessToken
      syncTokensToStorage()
      updateUserIdFromToken()
      console.log('✅ Access token refreshed successfully')
      
      // Reconnect SSE with new token (only if we're not already in the process of starting)
      // Use a small delay to ensure the old connection is fully closed
      stopSSEConnection()
      setTimeout(() => {
        if (accessToken.value && !sseConnection.value) {
          startSSEConnection()
        }
      }, 500)
      
      return true
    } catch (err) {
      console.error('❌ Token refresh failed:', err)
      // Only clear auth if refresh token is also invalid
      const axiosError = err as AxiosError<{ error?: string; message?: string }>
      if (axiosError.response?.status === 401) {
        console.error('❌ Refresh token is invalid, clearing auth')
        clearAuth()
      }
      return false
    }
  }

  function clearAuth() {
    stopSSEConnection()
    accessToken.value = null
    refreshToken.value = null
    userId.value = null
    username.value = null
    email.value = null
    error.value = null
    syncTokensToStorage()
  }

  // Helper methods for compatibility
  function getCurrentUserId(): string | null {
    return userId.value || getUserIdFromToken(accessToken.value)
  }

  function getTokens(): {
    accessToken: string | null
    refreshToken: string | null
  } {
    return {
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
    }
  }

  // Watch for token changes to manage SSE connection
  watch(accessToken, (newToken, oldToken) => {
    if (newToken && !oldToken) {
      // Token was set (login/register)
      startSSEConnection()
    } else if (newToken && oldToken && newToken !== oldToken) {
      // Token was refreshed
      stopSSEConnection()
      startSSEConnection()
    } else if (!newToken && oldToken) {
      // Token was cleared (logout)
      stopSSEConnection()
    }
  })

  return {
    // State
    accessToken,
    refreshToken,
    userId,
    username,
    email,
    isLoading,
    error,
    sseConnection,
    isSSEConnected,
    // Getters
    isAuthenticated,
    // Actions
    initialize,
    login,
    register,
    logout,
    refreshAccessToken,
    clearAuth,
    // Helper methods
    getCurrentUserId,
    getTokens,
    // SSE methods
    startSSEConnection,
    stopSSEConnection,
  }
})

