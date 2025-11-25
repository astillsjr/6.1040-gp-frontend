import { authAPI } from './api'
import { getUserIdFromToken } from '../utils/jwt'

export const authService = {
  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('accessToken')
  },

  // Get stored tokens
  getTokens() {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    }
  },

  // Get current user ID from access token
  getCurrentUserId() {
    const accessToken = localStorage.getItem('accessToken')
    return getUserIdFromToken(accessToken)
  },

  // Store tokens after login/register
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  },

  // Clear tokens on logout
  clearTokens() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  // Register a new user
  async register(username, password, email) {
    try {
      const response = await authAPI.register({ username, password, email })
      if (response.data.error) {
        throw new Error(response.data.error)
      }
      const { accessToken, refreshToken } = response.data
      this.setTokens(accessToken, refreshToken)
      return { success: true, user: response.data.user }
    } catch (error) {
      // Better error handling to see what's actually wrong
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.'
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        errorMessage = 'Cannot connect to server. Please check:\n1. Backend is running\n2. VITE_API_BASE_URL is set correctly\n3. No CORS issues'
      } else if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check your backend configuration.'
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.'
      } else {
        errorMessage = error.response?.data?.error || 
                      error.response?.data?.message ||
                      error.message || 
                      errorMessage
      }
      
      // Log full error for debugging
      console.error('Registration error:', {
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      })
      
      return { success: false, error: errorMessage }
    }
  },

  // Login existing user
  async login(username, password) {
    try {
      const response = await authAPI.login({ username, password })
      if (response.data.error) {
        throw new Error(response.data.error)
      }
      const { accessToken, refreshToken } = response.data
      this.setTokens(accessToken, refreshToken)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message }
    }
  },

  // Logout user
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await authAPI.logout({ refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearTokens()
    }
  },
}
