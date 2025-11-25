<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">
        <h1>LocalLoop</h1>
      </router-link>
      <div class="nav-links">
        <router-link to="/items" class="nav-link">Browse Items</router-link>
        
        <!-- Show different links based on authentication status -->
        <template v-if="isAuthenticated">
          <router-link to="/items/new" class="nav-link">List Item</router-link>
          <router-link to="/profile" class="nav-link">Profile</router-link>
          <button @click="handleLogout" class="nav-link logout-btn">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/register" class="nav-link register-btn">Sign Up</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/auth'

const router = useRouter()
const isAuthenticated = computed(() => authService.isAuthenticated())

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #A31F34 0%, #8A1538 100%);
  box-shadow: 0 4px 12px rgba(163, 31, 52, 0.3);
  z-index: 1000;
  height: 70px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  text-decoration: none;
  color: white;
  transition: opacity 0.2s;
}

.nav-brand:hover {
  opacity: 0.9;
}

.nav-brand h1 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  transition: all 0.2s;
  background: none;
  border: none;
  font-size: 15px;
  padding: 8px 16px;
  border-radius: 6px;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.15);
}

.nav-link.router-link-active {
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.logout-btn {
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.register-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
}

.register-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}
</style>
