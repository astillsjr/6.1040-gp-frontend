<template>
  <nav class="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-md shadow-sm z-[1000] h-[72px] border-b border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
      <router-link 
        to="/" 
        class="text-foreground hover:opacity-80 transition-opacity no-underline group"
      >
        <h1 class="text-2xl font-bold tracking-tight">
          <span class="text-primary">LocalLoop</span>
        </h1>
      </router-link>
      
      <div class="flex items-center gap-1 sm:gap-2">
        <router-link 
          to="/items" 
          class="text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm px-4 py-2 rounded-lg no-underline"
          active-class="bg-primary/10 text-primary font-semibold"
        >
          Browse Items
        </router-link>
        
        <!-- Show different links based on authentication status -->
        <template v-if="authStore.isAuthenticated">
          <!-- SSE Connection Status Indicator -->
          <div 
            class="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs"
            :class="authStore.isSSEConnected 
              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30' 
              : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30'"
            :title="authStore.isSSEConnected ? 'Real-time updates active' : 'Real-time updates offline'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="authStore.isSSEConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"></span>
            <span class="hidden sm:inline">{{ authStore.isSSEConnected ? 'Live' : 'Offline' }}</span>
          </div>
          
          <router-link 
            to="/items/new" 
            class="text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm px-4 py-2 rounded-lg no-underline"
            active-class="bg-primary/10 text-primary font-semibold"
          >
            List Item
          </router-link>
          <router-link 
            to="/activity" 
            class="text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm px-4 py-2 rounded-lg no-underline"
            active-class="bg-primary/10 text-primary font-semibold"
          >
            Activity
          </router-link>
          <router-link 
            to="/profile" 
            class="text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm px-4 py-2 rounded-lg no-underline"
            active-class="bg-primary/10 text-primary font-semibold"
          >
            {{ authStore.username }}
          </router-link>
          <button 
            @click="handleLogout" 
            class="text-foreground bg-accent hover:bg-accent/80 border border-border font-medium transition-all text-sm px-4 py-2 rounded-lg cursor-pointer"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <router-link 
            to="/login" 
            class="text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-all text-sm px-4 py-2 rounded-lg no-underline"
            active-class="bg-primary/10 text-primary font-semibold"
          >
            Login
          </router-link>
          <router-link 
            to="/register" 
            class="text-primary-foreground bg-primary hover:bg-recycling-green-dark border border-primary font-semibold transition-all text-sm px-4 py-2 rounded-lg no-underline shadow-sustainable hover:shadow-sustainable-lg"
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
