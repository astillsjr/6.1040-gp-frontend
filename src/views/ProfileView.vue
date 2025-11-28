<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <h1 class="text-gray-900 text-2xl font-semibold">My Profile</h1>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 py-6">
      <!-- Welcome Message for New Users -->
      <div v-if="isNewUser && !userProfileStore.hasProfile" class="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6">
        <h2 class="text-lg font-semibold mb-2">👋 Welcome to BorrowMIT!</h2>
        <p class="text-sm">Please complete your profile to start browsing and listing items.</p>
      </div>

      <!-- Loading State -->
      <div v-if="userProfileStore.isLoading" class="text-center py-12">
        <p class="text-gray-500">Loading profile...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="userProfileStore.error && !userProfileStore.hasProfile && !isNewUser" class="text-center py-12">
        <p class="text-red-500 mb-4">{{ userProfileStore.error }}</p>
        <Button variant="outline" @click="loadProfile">Try Again</Button>
      </div>

      <!-- Profile Content -->
      <template v-else>
        <!-- Profile Info Card -->
        <Card class="p-6 mb-6">
          <div class="flex items-start gap-4">
            <img
              :src="userAvatar"
              :alt="userProfileStore.displayName || 'User'"
              class="w-16 h-16 rounded-full"
            />
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-gray-900 mb-1">
                {{ userProfileStore.displayName || 'No display name set' }}
              </h2>
              <p class="text-gray-600 mb-2">{{ userProfileStore.dorm || 'No dorm set' }}</p>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1">
                  <Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span class="text-sm">{{ formattedRating }} rating</span>
                </div>
                <span class="text-sm text-gray-500">·</span>
                <span class="text-sm text-gray-600">
                  Lender: {{ userProfileStore.lenderScore.toFixed(1) }} | 
                  Borrower: {{ userProfileStore.borrowerScore.toFixed(1) }}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <!-- Profile Form -->
        <Card class="p-6">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handleUpdateProfile" class="space-y-6">
              <div class="space-y-2">
                <Label for="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  v-model="formData.displayName"
                  type="text"
                  placeholder="Your display name"
                  required
                  :disabled="userProfileStore.isLoading"
                />
              </div>

              <div class="space-y-2">
                <Label for="dorm">Dorm</Label>
                <Select
                  id="dorm"
                  :model-value="formData.dorm"
                  @update:model-value="formData.dorm = $event"
                  required
                  :disabled="userProfileStore.isLoading"
                >
                  <SelectItem value="" label="Select your dorm" />
                  <SelectItem
                    v-for="dorm in validDorms"
                    :key="dorm"
                    :value="dorm"
                    :label="dorm"
                  />
                </Select>
              </div>

              <div class="space-y-2">
                <Label for="bio">Bio</Label>
                <Textarea
                  id="bio"
                  v-model="formData.bio"
                  placeholder="Tell us about yourself..."
                  rows="4"
                  :disabled="userProfileStore.isLoading"
                />
              </div>

              <div v-if="userProfileStore.error" class="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20">
                <strong>Error:</strong> {{ userProfileStore.error }}
                <div v-if="userProfileStore.error.includes('504') || userProfileStore.error.includes('timeout')" class="mt-2 text-xs">
                  <p>⚠️ Backend server is not responding. Please make sure:</p>
                  <ul class="list-disc ml-4 mt-1">
                    <li>Your backend server is running</li>
                    <li>The API URL is configured correctly</li>
                    <li>There are no network/CORS issues</li>
                  </ul>
                </div>
              </div>

              <div v-if="successMessage" class="bg-green-50 text-green-800 p-3 rounded-md text-sm border border-green-200">
                {{ successMessage }}
              </div>

              <Button
                type="submit"
                :disabled="userProfileStore.isLoading || !isFormValid"
                class="w-full"
                size="lg"
              >
                {{ userProfileStore.isLoading ? 'Saving...' : 'Save Profile' }}
              </Button>
            </form>
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserProfileStore } from '@/stores/userProfileStore'
import { Button, Input, Label, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent, Select, SelectItem } from '@/components/ui'
import { Star } from 'lucide-vue-next'
import { VALID_DORMS } from '@/utils/validDorms'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userProfileStore = useUserProfileStore()

const validDorms = VALID_DORMS
const successMessage = ref('')
const isNewUser = computed(() => route.query.welcome === 'true')

const formData = ref({
  displayName: '',
  dorm: '',
  bio: '',
})

const isFormValid = computed(() => {
  return formData.value.displayName.trim() !== '' && formData.value.dorm !== ''
})

const userAvatar = computed(() => {
  const name = userProfileStore.displayName || authStore.username || 'User'
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
})

const formattedRating = computed(() => {
  return userProfileStore.averageScore.toFixed(1)
})

// Load profile on mount
onMounted(async () => {
  await loadProfile()
})

// Watch for profile changes and update form
watch(
  () => userProfileStore.currentProfile,
  (profile) => {
    if (profile) {
      formData.value = {
        displayName: profile.displayName || '',
        dorm: profile.dorm || '',
        bio: profile.bio || '',
      }
    }
  },
  { immediate: true }
)

async function loadProfile() {
  if (!authStore.userId) {
    return
  }

  await userProfileStore.fetchProfile(authStore.userId)
  
  // If no profile exists, initialize form with username as default displayName
  if (!userProfileStore.hasProfile) {
    formData.value = {
      displayName: authStore.username || '',
      dorm: '',
      bio: '',
    }
  }
}

async function handleUpdateProfile() {
  if (!authStore.userId) {
    return
  }

  successMessage.value = ''
  const isCreatingProfile = !userProfileStore.hasProfile

  try {
    if (userProfileStore.hasProfile) {
      // Update existing profile (supports all fields including bio)
      await userProfileStore.updateProfile({
        user: authStore.userId,
        displayName: formData.value.displayName.trim(),
        dorm: formData.value.dorm,
        bio: formData.value.bio.trim(),
      })
      successMessage.value = 'Profile updated successfully!'
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      // Create new profile (only supports displayName and dorm initially)
      await userProfileStore.createProfile({
        user: authStore.userId,
        displayName: formData.value.displayName.trim(),
        dorm: formData.value.dorm,
      })
      
      // If bio was provided, update the profile with it
      if (formData.value.bio.trim()) {
        await userProfileStore.updateProfile({
          user: authStore.userId,
          displayName: formData.value.displayName.trim(),
          dorm: formData.value.dorm,
          bio: formData.value.bio.trim(),
        })
      }

      // For new users, redirect to items page after successful profile creation
      if (isNewUser.value) {
        successMessage.value = 'Profile created successfully! Welcome to BorrowMIT!'
        setTimeout(() => {
          router.push('/items')
        }, 1500)
      } else {
        successMessage.value = 'Profile created successfully!'
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      }
    }
  } catch (error) {
    // Error is handled by userProfileStore.error
    console.error('Failed to update profile:', error)
  }
}
</script>
