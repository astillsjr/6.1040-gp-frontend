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
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          error.message || 
                          'Registration failed. Please check your connection and try again.'
      
      // Log full error for debugging
      console.error('Registration error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
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
