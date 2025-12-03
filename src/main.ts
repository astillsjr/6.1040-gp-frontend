import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { logBackendStatus } from './utils/backendCheck'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth store on app start (loads tokens from localStorage)
const authStore = useAuthStore()
authStore.initialize()

// Start SSE connection if user is already authenticated
if (authStore.isAuthenticated) {
  authStore.startSSEConnection()
}

app.mount('#app')

// Check backend connection on app start (only in development)
if (import.meta.env.DEV) {
  logBackendStatus().catch(console.error)
}

