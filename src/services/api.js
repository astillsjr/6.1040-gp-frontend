import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add access token to requests if available
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
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
          const response = await axios.post(`${API_BASE_URL}/api/UserAuthentication/refreshAccessToken`, {
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
  register: (data) => api.post('/api/UserAuthentication/register', data),
  login: (data) => api.post('/api/UserAuthentication/login', data),
  logout: (data) => api.post('/api/UserAuthentication/logout', data),
  changePassword: (data) => api.post('/api/UserAuthentication/changePassword', data),
  deleteAccount: (data) => api.post('/api/UserAuthentication/deleteAccount', data),
}

export const userProfileAPI = {
  createProfile: (data) => api.post('/api/UserProfile/createProfile', data),
  updateProfile: (data) => api.post('/api/UserProfile/updateProfile', data),
  getProfile: (data) => api.post('/api/UserProfile/getProfile', data),
}

export const itemListingAPI = {
  createItem: (data) => api.post('/api/ItemListing/createItem', data),
  updateItem: (data) => api.post('/api/ItemListing/updateItem', data),
  getItem: (data) => api.post('/api/ItemListing/getItem', data),
  searchItems: (data) => api.post('/api/ItemListing/searchItems', data),
  // Add other ItemListing methods as needed
}

// Generic method for calling any concept endpoint
export const callConcept = (concept, action, data) => {
  return api.post(`/api/${concept}/${action}`, data)
}

export default api
