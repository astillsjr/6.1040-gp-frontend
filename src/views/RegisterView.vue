<template>
  <div class="min-h-screen flex items-center justify-center bg-sustainable-gradient p-4 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-[200%] h-[200%] bg-radial-gradient pointer-events-none" />
    
    <Card class="w-full max-w-md relative z-10 shadow-sustainable-lg border-2">
      <CardHeader class="text-center pb-6">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-recycling-green-pale mb-4 mx-auto">
          <span class="text-3xl">🌱</span>
        </div>
        <CardTitle class="text-3xl font-bold text-foreground">Join LocalLoop</CardTitle>
        <p class="text-muted-foreground mt-2">Start sharing sustainably with the MIT community</p>
      </CardHeader>
      <CardContent>
        <div v-if="isDev && backendStatus && !backendStatus.success" class="bg-amber-50 border-2 border-amber-200 text-amber-800 p-4 rounded-xl text-sm mb-5">
          ⚠️ Cannot connect to backend API. Please check your configuration.
          <br><small class="opacity-80">API URL: {{ apiBaseUrl }}</small>
        </div>
        <!-- Success Message -->
        <div v-if="showSuccess" class="bg-green-50 border-2 border-green-200 text-green-800 p-4 rounded-xl text-sm mb-5 flex items-center gap-3" role="alert" aria-live="polite">
          <CheckCircle2 class="w-5 h-5 shrink-0" />
          <div>
            <p class="font-semibold">Account created successfully!</p>
            <p class="text-xs mt-1">Redirecting you now...</p>
          </div>
        </div>
        
        <form @submit.prevent="handleRegister" class="space-y-5">
          <div class="space-y-2">
            <Label for="username" class="text-foreground font-medium">Username</Label>
            <div class="relative">
              <Input
                id="username"
                v-model="username"
                type="text"
                required
                placeholder="Choose a username"
                :disabled="authStore.isLoading"
                class="h-12 rounded-xl border-2 focus:border-primary pr-10"
                :class="{ 'border-primary': username && !validationErrors.username, 'border-destructive': validationErrors.username }"
                @input="validateUsername()"
                autocomplete="username"
                aria-describedby="username-error"
                aria-invalid="!!validationErrors.username"
              />
              <div v-if="username && !validationErrors.username && username.length >= 3" class="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                <CheckCircle2 class="w-5 h-5" />
              </div>
            </div>
            <p v-if="validationErrors.username" id="username-error" class="text-sm text-destructive font-medium flex items-center gap-1">
              <span>⚠️</span>
              {{ validationErrors.username }}
            </p>
            <p v-else-if="username && username.length >= 3" class="text-xs text-muted-foreground">
              Username looks good!
            </p>
          </div>
          <div class="space-y-2">
            <Label for="email" class="text-foreground font-medium">Email</Label>
            <div class="relative">
              <Input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="your.email@mit.edu"
                :disabled="authStore.isLoading"
                class="h-12 rounded-xl border-2 focus:border-primary pr-10"
                :class="{ 'border-primary': email && !validationErrors.email && isMitEmail(email), 'border-destructive': validationErrors.email }"
                @input="validateEmail()"
                autocomplete="email"
                aria-describedby="email-error email-hint"
                aria-invalid="!!validationErrors.email"
              />
              <div v-if="email && !validationErrors.email && isMitEmail(email)" class="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                <CheckCircle2 class="w-5 h-5" />
              </div>
            </div>
            <p v-if="validationErrors.email" id="email-error" class="text-sm text-destructive font-medium flex items-center gap-1">
              <span>⚠️</span>
              {{ validationErrors.email }}
            </p>
            <p v-else-if="email && !isMitEmail(email) && isValidEmail(email)" id="email-hint" class="text-xs text-amber-600 font-medium">
              💡 Tip: Use your MIT email address (@mit.edu) to join the community
            </p>
            <p v-else-if="email && isMitEmail(email)" class="text-xs text-muted-foreground">
              MIT email verified!
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
                placeholder="Choose a password (min. 8 characters)"
                minlength="8"
                :disabled="authStore.isLoading"
                class="h-12 rounded-xl border-2 focus:border-primary pr-12 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                :class="{ 'border-primary': password && !validationErrors.password && password.length >= 8, 'border-destructive': validationErrors.password }"
                @input="validatePassword()"
                autocomplete="new-password"
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
            <p v-else-if="password && password.length >= 8" class="text-xs text-muted-foreground">
              Password meets requirements
            </p>
          </div>
          <div class="space-y-2">
            <Label for="confirmPassword" class="text-foreground font-medium">Confirm Password</Label>
            <div class="relative">
              <Input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                placeholder="Confirm your password"
                :disabled="authStore.isLoading"
                class="h-12 rounded-xl border-2 focus:border-primary pr-12 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                :class="{ 'border-primary': confirmPassword && passwordsMatch, 'border-destructive': validationErrors.confirmPassword }"
                @input="validateConfirmPassword()"
                autocomplete="new-password"
                aria-describedby="confirm-password-error"
                style="-webkit-text-security: none;"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                :disabled="authStore.isLoading"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-1"
                :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                tabindex="0"
              >
                <Eye v-if="!showConfirmPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
            <p v-if="validationErrors.confirmPassword" id="confirm-password-error" class="text-sm text-destructive font-medium flex items-center gap-1">
              <span>⚠️</span>
              {{ validationErrors.confirmPassword }}
            </p>
            <p v-else-if="confirmPassword && passwordsMatch" class="text-xs text-muted-foreground">
              Passwords match!
            </p>
          </div>
          <div v-if="authStore.error" class="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border-2 border-destructive/20" role="alert" aria-live="polite">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <p class="font-semibold mb-1">Registration Error</p>
                <p class="mb-2 whitespace-pre-line">{{ authStore.error }}</p>
                <div class="mt-3 pt-3 border-t border-destructive/20">
                  <p class="text-xs opacity-90 mb-2">Common issues:</p>
                  <ul class="text-xs opacity-90 space-y-1 list-disc list-inside">
                    <li>Username may already be taken</li>
                    <li>Email may already be registered</li>
                    <li>Check that all fields are filled correctly</li>
                  </ul>
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
              Creating account...
            </span>
            <span v-else>Register</span>
          </Button>
          <p class="text-center text-sm text-muted-foreground">
            Already have an account?
            <router-link to="/login" class="text-primary font-semibold hover:underline ml-1">
              Login here
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
import { checkBackendConnection } from '@/utils/backendCheck'
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const backendStatus = ref<{ success: boolean; message?: string } | null>(null)
const validationErrors = ref<{ username?: string; email?: string; password?: string; confirmPassword?: string }>({})
const showSuccess = ref(false)

// Get API base URL for display
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
const isDev = import.meta.env.DEV

const passwordsMatch = computed(() => {
  return password.value && password.value === confirmPassword.value
})

const isFormValid = computed(() => {
  return (
    username.value.length >= 3 &&
    isValidEmail(email.value) &&
    password.value.length >= 8 &&
    passwordsMatch.value &&
    Object.keys(validationErrors.value).length === 0
  )
})

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isMitEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith('@mit.edu')
}

// Validation functions
const validateUsername = () => {
  if (!username.value) {
    validationErrors.value.username = undefined
    return
  }
  if (username.value.length < 3) {
    validationErrors.value.username = 'Username must be at least 3 characters'
  } else if (username.value.length > 20) {
    validationErrors.value.username = 'Username must be less than 20 characters'
  } else if (!/^[a-zA-Z0-9_-]+$/.test(username.value)) {
    validationErrors.value.username = 'Username can only contain letters, numbers, underscores, and hyphens'
  } else {
    delete validationErrors.value.username
  }
}

const validateEmail = () => {
  if (!email.value) {
    validationErrors.value.email = undefined
    return
  }
  if (!isValidEmail(email.value)) {
    validationErrors.value.email = 'Please enter a valid email address'
  } else if (!isMitEmail(email.value)) {
    validationErrors.value.email = 'Please use your MIT email address (@mit.edu)'
  } else {
    delete validationErrors.value.email
  }
}

const validatePassword = () => {
  if (!password.value) {
    validationErrors.value.password = undefined
    return
  }
  if (password.value.length < 8) {
    validationErrors.value.password = 'Password must be at least 8 characters'
  } else {
    delete validationErrors.value.password
  }
  // Re-validate confirm password if it's been filled
  if (confirmPassword.value) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    validationErrors.value.confirmPassword = undefined
    return
  }
  if (!passwordsMatch.value) {
    validationErrors.value.confirmPassword = 'Passwords do not match'
  } else {
    delete validationErrors.value.confirmPassword
  }
}

onMounted(async () => {
  // Check backend connection status
  const status = await checkBackendConnection(apiBaseUrl)
  backendStatus.value = status
  
  if (!status.success) {
    console.warn('⚠️ Backend connection check failed:', status.message)
  }
  
  // Auto-focus first input
  const usernameInput = document.getElementById('username') as HTMLInputElement
  if (usernameInput) {
    usernameInput.focus()
  }
})

const handleRegister = async () => {
  // Validate all fields before submission
  validateUsername()
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  
  if (!isFormValid.value) {
    return
  }

  const result = await authStore.register(username.value, password.value, email.value)

  if (result.success) {
    showSuccess.value = true
    // Show success message briefly before redirect
    setTimeout(() => {
      // Redirect to the page they were trying to access, or profile page
      const redirect = (route.query.redirect as string) || '/profile'
      router.push({ path: redirect, query: { welcome: 'true' } })
    }, 1500)
  }
  // Error is handled by authStore.error
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

