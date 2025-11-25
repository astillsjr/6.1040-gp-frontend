<template>
  <div class="auth-container">
      <div class="auth-card">
        <h1>Join LocalLoop</h1>
        <div v-if="backendStatus && !backendStatus.success" class="backend-warning">
          ⚠️ Cannot connect to backend API. Please check your configuration.
          <br><small>API URL: {{ apiBaseUrl }}</small>
        </div>
        <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            placeholder="Choose a username"
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="your.email@mit.edu"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Choose a password"
            minlength="8"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Confirm your password"
          />
        </div>
        <div v-if="error" class="error-message">
          <strong>Registration Error:</strong><br>
          <span style="white-space: pre-line;">{{ error }}</span>
        </div>
        <button type="submit" :disabled="loading || !passwordsMatch" class="submit-btn">
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
        <p class="auth-footer">
          Already have an account?
          <router-link to="/login">Login here</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/auth'
import { checkBackendConnection } from '../utils/backendCheck'

const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const backendStatus = ref(null)

// Get API base URL for display
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

const passwordsMatch = computed(() => {
  return password.value && password.value === confirmPassword.value
})

onMounted(async () => {
  // Check backend connection status
  const status = await checkBackendConnection(apiBaseUrl)
  backendStatus.value = status
  
  if (!status.success) {
    console.warn('⚠️ Backend connection check failed:', status.message)
  }
})

const handleRegister = async () => {
  error.value = ''

  if (!passwordsMatch.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return
  }

  loading.value = true
  error.value = '' // Clear previous errors

  const result = await authService.register(username.value, password.value, email.value)

  if (result.success) {
    // Redirect to items page after successful registration
    router.push('/items')
  } else {
    // Show more detailed error message
    const errorMsg = result.error || 'Registration failed. Please try again.'
    error.value = errorMsg
    
    // Log for debugging
    console.error('Registration failed:', result)
  }

  loading.value = false
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #A31F34 0%, #8A1538 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(46, 125, 50, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.auth-card h1 {
  text-align: center;
  margin-bottom: 36px;
  color: #1A1A1A;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  font-weight: 600;
  color: #4A5568;
  font-size: 14px;
}

.form-group input {
  padding: 14px 16px;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  background-color: #F7FAFC;
}

.form-group input:focus {
  outline: none;
  border-color: #2E7D32;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.error-message {
  background-color: #FEE2E2;
  color: #A31F34;
  padding: 14px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  border: 1px solid #FECACA;
}

.submit-btn {
  padding: 14px;
  background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 125, 50, 0.4);
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.auth-footer {
  text-align: center;
  color: #718096;
  margin-top: 20px;
  font-size: 14px;
}

.auth-footer a {
  color: #2E7D32;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.auth-footer a:hover {
  color: #1B5E20;
  text-decoration: underline;
}

.backend-warning {
  background-color: #FEF3C7;
  color: #92400E;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  border: 1px solid #FCD34D;
  text-align: center;
}

.backend-warning small {
  display: block;
  margin-top: 4px;
  opacity: 0.8;
  font-size: 12px;
}
</style>
