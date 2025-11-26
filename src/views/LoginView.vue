<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#A31F34] to-[#8A1538] p-4 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-[200%] h-[200%] bg-radial-gradient from-green-500/10 to-transparent pointer-events-none" />
    
    <Card class="w-full max-w-md relative z-10 shadow-2xl">
      <CardHeader class="text-center">
        <CardTitle class="text-3xl font-bold">Login to BorrowMIT</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <Label for="username">Username</Label>
            <Input
              id="username"
              v-model="username"
              type="text"
              required
              placeholder="Enter your username"
              :disabled="authStore.isLoading"
            />
          </div>
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="Enter your password"
              :disabled="authStore.isLoading"
            />
          </div>
          <div v-if="authStore.error" class="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20">
            {{ authStore.error }}
          </div>
          <Button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full"
            size="lg"
          >
            {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
          </Button>
          <p class="text-center text-sm text-muted-foreground">
            Don't have an account?
            <router-link to="/register" class="text-primary font-semibold hover:underline">
              Register here
            </router-link>
          </p>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')

const handleLogin = async () => {
  const result = await authStore.login(username.value, password.value)

  if (result.success) {
    // Redirect to the page they were trying to access, or items page
    const redirect = (route.query.redirect as string) || '/items'
    router.push(redirect)
  }
  // Error is handled by authStore.authError
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
