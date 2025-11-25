import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { logBackendStatus } from './utils/backendCheck'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Check backend connection on app start (only in development)
if (import.meta.env.DEV) {
  logBackendStatus().catch(console.error)
}
