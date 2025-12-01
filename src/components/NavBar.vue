<template>
  <nav class="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#A31F34] to-[#8A1538] shadow-lg z-[1000] h-[70px] border-b border-[#8A1538]/20">
    <div class="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
      <router-link 
        to="/" 
        class="text-white hover:opacity-90 transition-opacity no-underline"
      >
        <h1 class="text-2xl font-bold tracking-tight">LocalLoop</h1>
      </router-link>
      
      <div class="flex items-center gap-2">
        <router-link 
          to="/items" 
          class="text-white/95 hover:text-white hover:bg-white/15 active:bg-white/20 font-medium transition-all text-sm px-4 py-2 rounded-md no-underline"
          active-class="bg-white/20 text-white font-semibold"
        >
          Browse Items
        </router-link>
        
        <!-- Show different links based on authentication status -->
        <template v-if="authStore.isAuthenticated">
          <router-link 
            to="/items/new" 
            class="text-white/95 hover:text-white hover:bg-white/15 active:bg-white/20 font-medium transition-all text-sm px-4 py-2 rounded-md no-underline"
            active-class="bg-white/20 text-white font-semibold"
          >
            List Item
          </router-link>
          <router-link 
            to="/activity" 
            class="text-white/95 hover:text-white hover:bg-white/15 active:bg-white/20 font-medium transition-all text-sm px-4 py-2 rounded-md no-underline"
            active-class="bg-white/20 text-white font-semibold"
          >
            Activity
          </router-link>
          <router-link 
            to="/profile" 
            class="text-white/95 hover:text-white hover:bg-white/15 active:bg-white/20 font-medium transition-all text-sm px-4 py-2 rounded-md no-underline"
            active-class="bg-white/20 text-white font-semibold"
          >
            {{ authStore.username }}
          </router-link>
          <button 
            @click="handleLogout" 
            class="text-white bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/50 font-medium transition-all text-sm px-4 py-2 rounded-md cursor-pointer"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <router-link 
            to="/login" 
            class="text-white/95 hover:text-white hover:bg-white/15 active:bg-white/20 font-medium transition-all text-sm px-4 py-2 rounded-md no-underline"
            active-class="bg-white/20 text-white font-semibold"
          >
            Login
          </router-link>
          <router-link 
            to="/register" 
            class="text-white bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/50 font-semibold transition-all text-sm px-4 py-2 rounded-md no-underline"
          >
            Sign Up
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>
