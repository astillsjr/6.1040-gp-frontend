// Pinia store for UserProfile management
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as userProfileAPI from '@/api/userProfile'
import type { UserProfile, CreateProfileRequest, UpdateProfileRequest } from '@/api/userProfile'

export const useUserProfileStore = defineStore('userProfile', () => {
  // State
  const currentProfile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasProfile = computed(() => !!currentProfile.value)
  const displayName = computed(() => currentProfile.value?.displayName || '')
  const dorm = computed(() => currentProfile.value?.dorm || '')
  const bio = computed(() => currentProfile.value?.bio || '')
  const lenderScore = computed(() => currentProfile.value?.lenderScore || 0)
  const borrowerScore = computed(() => currentProfile.value?.borrowerScore || 0)
  const averageScore = computed(() => {
    if (!currentProfile.value) return 0
    return (currentProfile.value.lenderScore + currentProfile.value.borrowerScore) / 2
  })
  const points = computed(() => currentProfile.value?.points || 0)

  // Actions
  async function fetchProfile(userId: string) {
    try {
      isLoading.value = true
      error.value = null

      const profile = await userProfileAPI.getProfile({ user: userId })
      if (profile) {
        currentProfile.value = profile
        console.log('Profile fetched successfully. Points:', profile.points)
      } else {
        console.warn('Profile returned null for user:', userId)
        // Don't set to null if we already have a profile - keep the existing one
        if (!currentProfile.value) {
          currentProfile.value = null
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch profile'
      error.value = errorMessage
      console.error('Error fetching profile:', err)
      // Don't clear existing profile on error
    } finally {
      isLoading.value = false
    }
  }

  async function createProfile(data: CreateProfileRequest) {
    try {
      isLoading.value = true
      error.value = null

      // Backend sync extracts user ID from token, so we only need displayName and dorm
      await userProfileAPI.createProfile(data)
      // Refresh profile after creation
      await fetchProfile(data.user)
    } catch (err: any) {
      let errorMessage = 'Failed to create profile'
      
      // Provide more helpful error messages
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || err.response?.status === 504) {
        errorMessage = 'Request timed out. Please check if the backend server is running and try again.'
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.'
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.error || 'Invalid profile data. Please check your inputs.'
      } else if (err.response?.status === 409) {
        errorMessage = 'Profile already exists for this user.'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      error.value = errorMessage
      console.error('Error creating profile:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(data: UpdateProfileRequest) {
    try {
      isLoading.value = true
      error.value = null

      await userProfileAPI.updateProfile(data)
      // Refresh profile after update
      await fetchProfile(data.user)
    } catch (err: any) {
      let errorMessage = 'Failed to update profile'
      
      // Provide more helpful error messages
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || err.response?.status === 504) {
        errorMessage = 'Request timed out. Please check if the backend server is running and try again.'
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.'
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.error || 'Invalid profile data. Please check your inputs.'
      } else if (err.response?.status === 404) {
        errorMessage = 'Profile not found. Please create a profile first.'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      error.value = errorMessage
      console.error('Error updating profile:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearProfile() {
    currentProfile.value = null
    error.value = null
  }

  return {
    // State
    currentProfile,
    isLoading,
    error,
    // Getters
    hasProfile,
    displayName,
    dorm,
    bio,
    lenderScore,
    borrowerScore,
    averageScore,
    points,
    // Actions
    fetchProfile,
    createProfile,
    updateProfile,
    clearProfile,
  }
})

