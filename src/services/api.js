import axios from 'axios'

// Get API base URL from environment or default to /api for local dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Helper function to build API endpoint paths
// Handles cases where API_BASE_URL may or may not include /api
// Supports: https://backend.onrender.com/api or https://backend.onrender.com
function buildApiPath(endpoint) {
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
  isProduction: import.meta.env.PROD
})

// Create axios instance
// Increased timeout for Render free tier which can take 30+ seconds to wake up
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for Render cold starts
})

// Add access token to requests if available
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    // Log the full URL being called for debugging
    const fullUrl = config.baseURL && config.url
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
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          // Use the same buildApiPath helper for consistency
          const refreshPath = buildApiPath('UserAuthentication/refreshAccessToken')
          // Build full URL - handle both absolute and relative baseURLs
          let refreshUrl
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

          const { accessToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`

          return api(originalRequest)
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

// API methods for different concepts
export const authAPI = {
  register: (data) => api.post(buildApiPath('UserAuthentication/register'), data),
  login: (data) => api.post(buildApiPath('UserAuthentication/login'), data),
  logout: (data) => api.post(buildApiPath('UserAuthentication/logout'), data),
  changePassword: (data) => api.post(buildApiPath('UserAuthentication/changePassword'), data),
  deleteAccount: (data) => api.post(buildApiPath('UserAuthentication/deleteAccount'), data),
}

export const userProfileAPI = {
  createProfile: (data) => api.post(buildApiPath('UserProfile/createProfile'), data),
  updateProfile: (data) => api.post(buildApiPath('UserProfile/updateProfile'), data),
  getProfile: (data) => api.post(buildApiPath('UserProfile/getProfile'), data),
}

export const itemListingAPI = {
  createItem: (data) => api.post(buildApiPath('ItemListing/createItem'), data),
  updateItem: (data) => api.post(buildApiPath('ItemListing/updateItem'), data),
  getItem: (data) => api.post(buildApiPath('ItemListing/getItem'), data),
  searchItems: (data) => api.post(buildApiPath('ItemListing/searchItems'), data),
  // Add other ItemListing methods as needed
}

// Generic method for calling any concept endpoint
export const callConcept = (concept, action, data) => {
  return api.post(buildApiPath(`${concept}/${action}`), data)
}

export default api
