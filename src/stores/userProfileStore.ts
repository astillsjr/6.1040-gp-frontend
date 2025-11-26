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

  // Actions
  async function fetchProfile(userId: string) {
    try {
      isLoading.value = true
      error.value = null

      const profile = await userProfileAPI.getProfile({ user: userId })
      currentProfile.value = profile
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch profile'
      error.value = errorMessage
      console.error('Error fetching profile:', err)
      currentProfile.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function createProfile(data: CreateProfileRequest) {
    try {
      isLoading.value = true
      error.value = null

      await userProfileAPI.createProfile(data)
      // Refresh profile after creation
      await fetchProfile(data.user)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create profile'
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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update profile'
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
    // Actions
    fetchProfile,
    createProfile,
    updateProfile,
    clearProfile,
  }
})

