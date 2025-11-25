<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">
        <h1>LocalLoop</h1>
      </router-link>
      <div class="nav-links">
        <router-link to="/items" class="nav-link">Browse Items</router-link>
        <router-link to="/items/new" class="nav-link">List Item</router-link>
        <router-link to="/profile" class="nav-link">Profile</router-link>
        <button @click="handleLogout" class="nav-link logout-btn">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { authService } from '../services/auth'

const router = useRouter()

const handleLogout = async () => {
  await authService.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 60px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  text-decoration: none;
  color: #2c3e50;
}

.nav-brand h1 {
  font-size: 24px;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  transition: color 0.2s;
  background: none;
  border: none;
  font-size: 16px;
}

.nav-link:hover {
  color: #42b983;
}

.nav-link.router-link-active {
  color: #42b983;
}

.logout-btn {
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  background-color: #f0f0f0;
}

.logout-btn:hover {
  background-color: #e0e0e0;
}
</style>
