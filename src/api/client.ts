// Shared axios client with authentication and error handling
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

// Get API base URL from environment or default to /api for local dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Helper function to build API endpoint paths
// Handles cases where API_BASE_URL may or may not include /api
// Supports: https://backend.onrender.com/api or https://backend.onrender.com
export function buildApiPath(endpoint: string): string {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

  // Check if API_BASE_URL is an absolute URL (starts with http:// or https://)
  const isAbsoluteUrl = API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')

  // Normalize API_BASE_URL (remove trailing slash if present)
  const normalizedBase = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL

  // If API_BASE_URL ends with /api (with or without trailing slash), don't add /api again
  if (normalizedBase.endsWith('/api')) {
    // For absolute URLs, return path without leading slash (axios will combine correctly)
    // For relative URLs, return path with leading slash
    return isAbsoluteUrl ? cleanEndpoint : `/${cleanEndpoint}`
  }
  // If API_BASE_URL is just /api (local dev), use as is
  if (normalizedBase === '/api') {
    return `/${cleanEndpoint}`
  }
  // Otherwise, add /api prefix
  // For absolute URLs, return path without leading slash
  // For relative URLs, return path with leading slash
  return isAbsoluteUrl ? `api/${cleanEndpoint}` : `/api/${cleanEndpoint}`
}

// Log API configuration for debugging
console.log('🔧 API Configuration:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  resolved: API_BASE_URL,
  mode: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
})

// Create axios instance
// Increased timeout for Render free tier which can take 30+ seconds to wake up
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for Render cold starts
})

// Helper to check if access token is expired or about to expire
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    // Consider token expired if it expires within the next 60 seconds
    return expirationTime - currentTime < 60000
  } catch {
    return true // If we can't parse it, consider it expired
  }
}

// Helper to refresh access token
async function refreshAccessTokenIfNeeded(): Promise<string | null> {
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')

  if (!accessToken || !refreshToken) {
    return null
  }

  // Check if token is expired or about to expire
  if (isTokenExpired(accessToken)) {
    try {
      const refreshPath = buildApiPath('UserAuthentication/refreshAccessToken')
      // Build full URL - handle both absolute and relative baseURLs
      let refreshUrl: string
      if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
        // Absolute URL: combine baseURL with path (refreshPath already has correct format)
        const normalizedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
        refreshUrl = `${normalizedBase}/${refreshPath}`
      } else {
        // Relative URL (like /api): combine directly
        refreshUrl = `${API_BASE_URL}${refreshPath}`
      }

      const response = await axios.post(refreshUrl, { refreshToken })
      const { accessToken: newAccessToken } = response.data as { accessToken: string }
      localStorage.setItem('accessToken', newAccessToken)
      console.log('🔄 Access token refreshed successfully')
      return newAccessToken
    } catch (error) {
      console.error('Failed to refresh access token:', error)
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login?expired=true'
      return null
    }
  }

  return accessToken
}

// Add access token to requests if available, and refresh if needed
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip token refresh for the refresh endpoint itself
    if (config.url?.includes('refreshAccessToken')) {
      return config
    }

    // Proactively refresh token if expired
    const accessToken = await refreshAccessTokenIfNeeded()
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    
    // Log the full URL being called for debugging
    const fullUrl =
      config.baseURL && config.url
        ? `${config.baseURL}${config.url}`
        : config.url
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${fullUrl}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token refresh on 401 errors and potential auth-related 504 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Handle 401 Unauthorized or 504 Gateway Timeout (which can be caused by expired tokens)
    const status = error.response?.status
    const isAuthError = status === 401
    const isPotentialAuthTimeout = status === 504 && localStorage.getItem('accessToken')

    if ((isAuthError || isPotentialAuthTimeout) && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          console.log(`🔄 Attempting token refresh due to ${status} error`)
          
          // Use the same buildApiPath helper for consistency
          const refreshPath = buildApiPath('UserAuthentication/refreshAccessToken')
          // Build full URL - handle both absolute and relative baseURLs
          let refreshUrl: string
          if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
            // Absolute URL: combine baseURL with path (refreshPath already has correct format)
            const normalizedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
            refreshUrl = `${normalizedBase}/${refreshPath}`
          } else {
            // Relative URL (like /api): combine directly
            refreshUrl = `${API_BASE_URL}${refreshPath}`
          }

          const response = await axios.post(refreshUrl, {
            refreshToken,
          })

          const { accessToken } = response.data as { accessToken: string }
          localStorage.setItem('accessToken', accessToken)
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }

          console.log('✅ Token refreshed, retrying request')
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        console.error('❌ Token refresh failed, redirecting to login')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login?expired=true'
        return Promise.reject(refreshError)
      }
    }

    // Add more helpful error messages for common scenarios
    if (status === 504) {
      error.message = 'Request timed out. Please check your connection and try again.'
    } else if (status === 401) {
      error.message = 'Your session has expired. Please log in again.'
    }

    return Promise.reject(error)
  }
)

// Helper to extract data from axios response
export function extractData<T>(response: { data: T }): T {
  return response.data
}

