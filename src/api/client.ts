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

  // Normalize API_BASE_URL (remove trailing slash if present)
  const normalizedBase = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL

  // If API_BASE_URL ends with /api (with or without trailing slash), don't add /api again
  if (normalizedBase.endsWith('/api')) {
    return `/${cleanEndpoint}`
  }
  // If API_BASE_URL is just /api (local dev), use as is
  if (normalizedBase === '/api') {
    return `/${cleanEndpoint}`
  }
  // Otherwise, add /api prefix
  return `/api/${cleanEndpoint}`
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

// Add access token to requests if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken')
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

// Handle token refresh on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          // Use the same buildApiPath helper for consistency
          const refreshPath = buildApiPath('UserAuthentication/refreshAccessToken')
          // Build full URL - handle both absolute and relative baseURLs
          let refreshUrl: string
          if (API_BASE_URL.startsWith('http')) {
            // Absolute URL
            refreshUrl = API_BASE_URL.endsWith('/')
              ? `${API_BASE_URL.slice(0, -1)}${refreshPath}`
              : `${API_BASE_URL}${refreshPath}`
          } else {
            // Relative URL (like /api)
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

          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Helper to extract data from axios response
export function extractData<T>(response: { data: T }): T {
  return response.data
}

