<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="bg-card/95 backdrop-blur-sm border-b border-border">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-foreground text-3xl font-bold">My Profile</h1>
        <p class="text-muted-foreground text-base mt-2">Manage your profile information and preferences</p>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Message for New Users -->
      <div v-if="isNewUser && !userProfileStore.hasProfile" class="bg-sky-blue-light border-2 border-sky-blue text-sky-blue p-5 rounded-2xl mb-6">
        <h2 class="text-xl font-bold mb-2">👋 Welcome to LocalLoop!</h2>
        <p class="text-base">Please complete your profile to start browsing and listing items.</p>
      </div>

      <!-- Loading State -->
      <div v-if="userProfileStore.isLoading" class="text-center py-16">
        <p class="text-muted-foreground text-lg">Loading profile...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="userProfileStore.error && !userProfileStore.hasProfile && !isNewUser" class="text-center py-16">
        <p class="text-destructive mb-6 text-lg">{{ userProfileStore.error }}</p>
        <Button variant="outline" @click="loadProfile" class="rounded-xl">Try Again</Button>
      </div>

      <!-- Profile Content -->
      <template v-else>
        <!-- Profile Info Card -->
        <Card class="p-6 mb-6 border-2">
          <div class="flex flex-col sm:flex-row items-start gap-5">
            <img
              :src="userAvatar"
              :alt="userProfileStore.displayName || 'User'"
              class="w-20 h-20 rounded-full border-2 border-border"
            />
            <div class="flex-1 w-full sm:w-auto">
              <h2 class="text-2xl font-bold text-foreground mb-2">
                {{ userProfileStore.displayName || authStore.username || 'No display name set' }}
              </h2>
              <p class="text-muted-foreground mb-3 text-base">{{ userProfileStore.dorm || 'No dorm set' }}</p>
              <div class="flex items-center gap-4 flex-wrap">
                <div class="flex items-center gap-1.5">
                  <Star class="w-5 h-5 fill-recycling-green text-recycling-green" />
                  <span class="text-sm font-medium text-foreground">{{ formattedRating }} rating</span>
                </div>
                <span class="text-sm text-muted-foreground">·</span>
                <span class="text-sm text-muted-foreground">
                  Lender: <span class="font-medium text-foreground">{{ userProfileStore.lenderScore.toFixed(1) }}</span> | 
                  Borrower: <span class="font-medium text-foreground">{{ userProfileStore.borrowerScore.toFixed(1) }}</span>
                </span>
              </div>
            </div>
            <!-- Points Display -->
            <div class="text-center bg-gradient-to-br from-recycling-green-pale to-recycling-green-subtle p-4 rounded-xl border-2 border-recycling-green-subtle w-full sm:w-auto sm:min-w-[120px]">
              <div class="flex items-center justify-center gap-2 mb-1">
                <Trophy class="w-5 h-5 text-recycling-green" />
                <span class="text-2xl font-bold text-recycling-green-dark">{{ userProfileStore.points }}</span>
              </div>
              <p class="text-sm text-recycling-green-dark font-medium">points</p>
            </div>
          </div>
        </Card>

        <!-- Profile Form -->
        <Card class="p-6 border-2">
          <CardHeader class="pb-4">
            <CardTitle class="text-2xl">Profile Information</CardTitle>
            <CardDescription class="text-base">Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handleUpdateProfile" class="space-y-5">
           

              <div class="space-y-2">
                <Label for="dorm" class="font-medium">Dorm <span class="text-destructive">*</span></Label>
                <Select
                  id="dorm"
                  :model-value="formData.dorm"
                  @update:model-value="handleDormChange"
                  required
                  :disabled="userProfileStore.isLoading"
                  :class="{ 'border-destructive': dormError }"
                >
                  <SelectItem value="" label="Select your dorm" />
                  <SelectItem
                    v-for="dorm in validDorms"
                    :key="dorm"
                    :value="dorm"
                    :label="dorm"
                  />
                </Select>
                <p v-if="dormError" class="text-sm text-destructive font-medium">{{ dormError }}</p>
                <p v-else class="text-sm text-muted-foreground">Please select your dorm (required)</p>
              </div>

              <div class="space-y-2">
                <Label for="bio" class="font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  v-model="formData.bio"
                  placeholder="Tell us about yourself..."
                  rows="4"
                  :disabled="userProfileStore.isLoading"
                  class="rounded-xl border-2 focus:border-primary"
                />
              </div>

              <div v-if="userProfileStore.error" class="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border-2 border-destructive/20">
                <strong>Error:</strong> {{ userProfileStore.error }}
                <div v-if="userProfileStore.error.includes('504') || userProfileStore.error.includes('timeout')" class="mt-3 text-xs">
                  <p>⚠️ Backend server is not responding. Please make sure:</p>
                  <ul class="list-disc ml-4 mt-1 space-y-1">
                    <li>Your backend server is running</li>
                    <li>The API URL is configured correctly</li>
                    <li>There are no network/CORS issues</li>
                  </ul>
                </div>
              </div>

              <div v-if="successMessage" class="bg-recycling-green-pale text-recycling-green-dark p-4 rounded-xl text-sm border-2 border-recycling-green-subtle">
                {{ successMessage }}
              </div>

              <Button
                type="submit"
                :disabled="userProfileStore.isLoading || !isFormValid"
                class="w-full h-12 rounded-xl font-semibold shadow-sustainable hover:shadow-sustainable-lg"
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
import { Button, Label, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent, Select, SelectItem } from '@/components/ui'
import { Star, Trophy } from 'lucide-vue-next'
import { VALID_DORMS } from '@/utils/validDorms'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userProfileStore = useUserProfileStore()

const validDorms = VALID_DORMS
const successMessage = ref('')
const isNewUser = computed(() => route.query.welcome === 'true')

const formData = ref({
  dorm: '',
  bio: '',
})

const dormError = ref('')

const isFormValid = computed(() => {
  return formData.value.dorm !== '' && formData.value.dorm.trim() !== ''
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
        dorm: profile.dorm || '',
        bio: profile.bio || '',
      }
    }
  },
  { immediate: true }
)

function handleDormChange(value: string) {
  formData.value.dorm = value
  dormError.value = ''
}

async function loadProfile() {
  if (!authStore.userId) {
    return
  }

  await userProfileStore.fetchProfile(authStore.userId)
  
  // If no profile exists, initialize form
  if (!userProfileStore.hasProfile) {
    formData.value = {
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
  dormError.value = ''

  // Validate dorm is required
  if (!formData.value.dorm || formData.value.dorm.trim() === '') {
    dormError.value = 'Please select your dorm to continue'
    return
  }

  try {
    // Display name is always set to username
    const displayName = authStore.username || ''
    
    if (userProfileStore.hasProfile) {
      // Update existing profile (displayName is always username, only update dorm and bio)
      await userProfileStore.updateProfile({
        user: authStore.userId,
        displayName: displayName,
        dorm: formData.value.dorm,
        bio: formData.value.bio.trim(),
      })
      successMessage.value = 'Profile updated successfully!'
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      // Create new profile with username as displayName
      await userProfileStore.createProfile({
        user: authStore.userId,
        displayName: displayName,
        dorm: formData.value.dorm,
      })
      
      // If bio was provided, update the profile with it
      if (formData.value.bio.trim()) {
        await userProfileStore.updateProfile({
          user: authStore.userId,
          displayName: displayName,
          dorm: formData.value.dorm,
          bio: formData.value.bio.trim(),
        })
      }

      // For new users, redirect to items page after successful profile creation
      if (isNewUser.value) {
        successMessage.value = 'Profile created successfully! Welcome to LocalLoop!'
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
