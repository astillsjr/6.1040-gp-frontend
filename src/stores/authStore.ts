// Pinia store for authentication
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authAPI from '@/api/auth'
import { getUserIdFromToken } from '@/utils/jwt'
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

  // Actions
  function initialize() {
    // Load tokens and username from localStorage
    const storedAccessToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedUsername = localStorage.getItem('username')

    if (storedAccessToken) {
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
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      // Store the username from the login form
      username.value = loginUsername
      syncTokensToStorage()
      updateUserIdFromToken()

      return { success: true }
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>
      const errorMessage =
        axiosError.response?.data?.error || axiosError.message || 'Login failed'
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
      clearAuth()
      isLoading.value = false
    }
  }

  async function refreshAccessToken(): Promise<boolean> {
    try {
      if (!refreshToken.value) {
        return false
      }

      const response = await authAPI.refreshAccessToken({
        refreshToken: refreshToken.value,
      })
      accessToken.value = response.accessToken
      syncTokensToStorage()
      updateUserIdFromToken()
      return true
    } catch (err) {
      console.error('Token refresh failed:', err)
      clearAuth()
      return false
    }
  }

  function clearAuth() {
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

  return {
    // State
    accessToken,
    refreshToken,
    userId,
    username,
    email,
    isLoading,
    error,
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
  }
})

