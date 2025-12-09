<template>
  <div class="min-h-screen flex items-center justify-center bg-sustainable-gradient p-4 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-[200%] h-[200%] bg-radial-gradient pointer-events-none" />
    
    <Card class="w-full max-w-md relative z-10 shadow-sustainable-lg border-2">
      <CardHeader class="text-center pb-6">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-recycling-green-pale mb-4 mx-auto">
          <span class="text-3xl">🌱</span>
        </div>
        <CardTitle class="text-3xl font-bold text-foreground">Login to LocalLoop</CardTitle>
        <p class="text-muted-foreground mt-2">Welcome back to MIT's sustainable sharing platform</p>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Session expired notification -->
          <div v-if="route.query.expired === 'true'" class="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm border-2 border-amber-200">
            ⏱️ Your session has expired. Please log in again to continue.
          </div>
          
          <div class="space-y-2">
            <Label for="username" class="text-foreground font-medium">Username</Label>
            <div class="relative">
              <Input
                id="username"
                v-model="username"
                type="text"
                required
                placeholder="Enter your username"
                :disabled="authStore.isLoading"
                class="h-12 rounded-xl border-2 focus:border-primary pr-10"
                :class="{ 'border-primary': username && !validationErrors.username, 'border-destructive': validationErrors.username }"
                @input="clearError; validateUsername()"
                autocomplete="username"
                aria-describedby="username-error"
                aria-invalid="!!validationErrors.username"
              />
              <div v-if="username && !validationErrors.username" class="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p v-if="validationErrors.username" id="username-error" class="text-sm text-destructive font-medium flex items-center gap-1">
              <span>⚠️</span>
              {{ validationErrors.username }}
            </p>
          </div>
          <div class="space-y-2">
            <Label for="password" class="text-foreground font-medium">Password</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Enter your password"
                :disabled="authStore.isLoading"
                class="h-12 rounded-xl border-2 focus:border-primary pr-12 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                :class="{ 'border-primary': password && !validationErrors.password, 'border-destructive': validationErrors.password }"
                @input="clearError; validatePassword()"
                autocomplete="current-password"
                aria-describedby="password-error"
                style="-webkit-text-security: none;"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                :disabled="authStore.isLoading"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-1"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                tabindex="0"
              >
                <Eye v-if="!showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
            <p v-if="validationErrors.password" id="password-error" class="text-sm text-destructive font-medium flex items-center gap-1">
              <span>⚠️</span>
              {{ validationErrors.password }}
            </p>
          </div>
          <div v-if="authStore.error" class="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border-2 border-destructive/20" role="alert" aria-live="polite">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <p class="font-semibold mb-1">Login Failed</p>
                <p class="mb-2">{{ authStore.error }}</p>
                <div class="mt-3 pt-3 border-t border-destructive/20">
                  <p class="text-xs opacity-90 mb-2">Troubleshooting tips:</p>
                  <ul class="text-xs opacity-90 space-y-1 list-disc list-inside">
                    <li>Check that your username and password are correct</li>
                    <li>Make sure Caps Lock is off</li>
                    <li>Try resetting your password if you've forgotten it</li>
                  </ul>
                  <p class="text-xs opacity-90 mt-2">
                    Don't have an account? <router-link to="/register" class="underline font-semibold hover:no-underline">Create one here</router-link>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            :disabled="authStore.isLoading || !isFormValid"
            class="w-full h-12 rounded-xl font-semibold shadow-sustainable hover:shadow-sustainable-lg relative"
            size="lg"
            aria-busy="authStore.isLoading"
          >
            <span v-if="authStore.isLoading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </span>
            <span v-else>Login</span>
          </Button>
          <p class="text-center text-sm text-muted-foreground">
            Don't have an account?
            <router-link to="/register" class="text-primary font-semibold hover:underline ml-1">
              Register here
            </router-link>
          </p>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const validationErrors = ref<{ username?: string; password?: string }>({})

// Form validation
const isFormValid = computed(() => {
  return username.value.length > 0 && password.value.length > 0 && Object.keys(validationErrors.value).length === 0
})

// Clear error when user starts typing
const clearError = () => {
  if (authStore.error) {
    authStore.error = null
  }
}

// Validation functions
const validateUsername = () => {
  if (!username.value) {
    validationErrors.value.username = undefined
    return
  }
  if (username.value.length < 3) {
    validationErrors.value.username = 'Username must be at least 3 characters'
  } else {
    delete validationErrors.value.username
  }
}

const validatePassword = () => {
  if (!password.value) {
    validationErrors.value.password = undefined
    return
  }
  if (password.value.length < 1) {
    validationErrors.value.password = 'Password is required'
  } else {
    delete validationErrors.value.password
  }
}

// Auto-focus first input
onMounted(() => {
  const usernameInput = document.getElementById('username') as HTMLInputElement
  if (usernameInput) {
    usernameInput.focus()
  }
})

const handleLogin = async () => {
  // Clear any previous errors
  authStore.error = null
  
  const result = await authStore.login(username.value, password.value)

  if (result.success) {
    // Redirect to the page they were trying to access, or items page
    const redirect = (route.query.redirect as string) || '/items'
    router.push(redirect)
  }
  // Error is handled by authStore.error and displayed in the template
}
</script>

<style scoped>
/* Hide browser's native password reveal buttons */
:deep(input[type="password"]::-ms-reveal),
:deep(input[type="password"]::-ms-clear) {
  display: none;
}

:deep(input[type="password"]::-webkit-credentials-auto-fill-button) {
  display: none !important;
}
</style>

