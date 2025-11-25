<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Login to LocalLoop</h1>
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            placeholder="Enter your username"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
          />
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p class="auth-footer">
          Don't have an account?
          <router-link to="/register">Register here</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '../services/auth'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  const result = await authService.login(username.value, password.value)

  if (result.success) {
    // Redirect to the page they were trying to access, or home
    const redirect = route.query.redirect || '/items'
    router.push(redirect)
  } else {
    error.value = result.error || 'Login failed. Please try again.'
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
</style>
