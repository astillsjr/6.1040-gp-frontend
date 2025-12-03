<template>
  <div class="min-h-screen bg-background">
    <!-- Hero Section -->
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12">
      <!-- Subtle background decoration -->
      <div class="absolute inset-0 bg-sustainable-gradient rounded-3xl -z-10 opacity-50"></div>
      
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-recycling-green-pale text-recycling-green-dark text-sm font-medium mb-6 border border-recycling-green-subtle">
          <span>🌱</span>
          <span>Sustainable Resource Sharing</span>
        </div>
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
          Welcome to <span class="text-primary">LocalLoop</span>
        </h1>
        <p class="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          MIT's Community Resource Sharing Platform. Borrow items from fellow students, share what you have, and build a more sustainable campus.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/items" class="inline-flex items-center justify-center gap-2 h-12 rounded-xl px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-recycling-green-dark transition-all shadow-sustainable hover:shadow-sustainable-lg transform hover:-translate-y-0.5 w-full sm:w-auto">
            <Search class="w-5 h-5" />
            Browse Items
          </router-link>
          <router-link
            v-if="authStore.isAuthenticated"
            to="/items/new"
            class="inline-flex items-center justify-center gap-2 h-12 rounded-xl px-8 text-base font-semibold border-2 border-primary/20 bg-card text-foreground hover:bg-recycling-green-pale hover:border-primary/40 transition-all w-full sm:w-auto"
          >
            <Plus class="w-5 h-5" />
            List an Item
          </router-link>
          <router-link
            v-else
            to="/register"
            class="inline-flex items-center justify-center gap-2 h-12 rounded-xl px-8 text-base font-semibold border-2 border-primary/20 bg-card text-foreground hover:bg-recycling-green-pale hover:border-primary/40 transition-all w-full sm:w-auto"
          >
            Get Started
          </router-link>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-foreground mb-4">
        How it works
      </h2>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          A simple, sustainable way to share resources within the MIT community
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <!-- Find Items -->
        <Card class="p-8 text-center hover:shadow-sustainable-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20 group">
          <div class="w-16 h-16 bg-sky-blue-light rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Search class="w-8 h-8 text-sky-blue" />
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-3">Find Items</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">
            Search for items you need from fellow MIT students
          </p>
        </Card>

        <!-- List Items -->
        <Card class="p-8 text-center hover:shadow-sustainable-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20 group">
          <div class="w-16 h-16 bg-recycling-green-pale rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Package class="w-8 h-8 text-recycling-green" />
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-3">List Items</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">
            Share your unused items with the MIT community
          </p>
        </Card>

        <!-- Connect -->
        <Card class="p-8 text-center hover:shadow-sustainable-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20 group">
          <div class="w-16 h-16 bg-recycling-green-subtle rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <MessageSquare class="w-8 h-8 text-recycling-green-dark" />
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-3">Connect</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">
            Coordinate borrows through in-app messaging
          </p>
        </Card>

        <!-- Earn Rewards -->
        <Card class="p-8 text-center hover:shadow-sustainable-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20 group">
          <div class="w-16 h-16 bg-recycling-green-pale rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Star class="w-8 h-8 text-recycling-green fill-recycling-green" />
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-3">Earn Rewards</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">
            Get rewarded for lending and helping the community (once you have 500 points email localloop@mit.edu for rewards!)
          </p>
        </Card>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="bg-card border-t border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div class="space-y-2">
            <div class="text-4xl sm:text-5xl font-bold text-primary mb-2">{{ displayItemCount() }}</div>
            <p class="text-base text-muted-foreground font-medium">Items Available</p>
          </div>
          <div class="space-y-2">
            <div class="text-4xl sm:text-5xl font-bold text-primary mb-2">{{ displayUserCount() }}</div>
            <p class="text-base text-muted-foreground font-medium">Active Users</p>
          </div>
          <div class="space-y-2">
            <div class="text-4xl sm:text-5xl font-bold text-primary mb-2">{{ displaySuccessfulBorrowsCount() }}</div>
            <p class="text-base text-muted-foreground font-medium">Successful Borrows</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-background border-t border-border">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Ready to get started?
        </h2>
        <p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join the MIT community and start borrowing and sharing today.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            v-if="!authStore.isAuthenticated"
            to="/register"
            class="inline-flex items-center justify-center gap-2 h-12 rounded-xl px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-recycling-green-dark transition-all shadow-sustainable hover:shadow-sustainable-lg transform hover:-translate-y-0.5 w-full sm:w-auto"
          >
            Create Account
          </router-link>
          <router-link
            to="/items"
            class="inline-flex items-center justify-center gap-2 h-12 rounded-xl px-8 text-base font-semibold border-2 border-primary/20 bg-card text-foreground hover:bg-recycling-green-pale hover:border-primary/40 transition-all w-full sm:w-auto"
          >
            Browse Items
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useItemStore } from '@/stores/itemStore'
import { Card } from '@/components/ui'
import { Search, Plus, Package, MessageSquare, Star } from 'lucide-vue-next'
import { getUserCount } from '@/api/auth'
import { getSuccessfulBorrowsCount } from '@/api/itemTransaction'

const authStore = useAuthStore()
const itemStore = useItemStore()
const userCount = ref<number | null>(null)
const successfulBorrowsCount = ref<number | null>(null)
const isLoading = ref(true)

// Use the itemStore's items count to match what's shown on the browse items page
const itemCount = computed(() => itemStore.items.length)

onMounted(async () => {
  // Set a maximum wait time - if it takes longer, show a fallback
  const maxWaitTime = 3000 // 3 seconds
  const timeoutId = setTimeout(() => {
    if (userCount.value === null) {
      console.warn('⚠️ User count fetch taking too long, showing fallback')
      userCount.value = 0
    }
    isLoading.value = false
  }, maxWaitTime)

  // Fetch user count
  try {
    console.log('📊 Fetching user count...')
    const count = await getUserCount()
    clearTimeout(timeoutId)
    console.log('✅ User count received:', count)
    userCount.value = count
  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error('❌ Failed to fetch user count:', error)
    console.error('Error response:', error.response?.data)
    // Set to 0 on error so we show something instead of "..."
    userCount.value = 0
  } finally {
    isLoading.value = false
  }

  // Fetch successful borrows count
  try {
    console.log('📊 Fetching successful borrows count...')
    const count = await getSuccessfulBorrowsCount()
    console.log('✅ Successful borrows count received:', count)
    successfulBorrowsCount.value = count
  } catch (error: any) {
    console.error('❌ Failed to fetch successful borrows count:', error)
    // Set to 0 on error so we show something instead of "TBD"
    successfulBorrowsCount.value = 0
  }

  // Fetch items to populate the count (same data source as browse items page)
  try {
    await itemStore.fetchItems()
  } catch (error: any) {
    console.error('❌ Failed to fetch items:', error)
  }
})

const displayUserCount = () => {
  if (isLoading.value && userCount.value === null) {
    return '...'
  }
  // If we have a count, show it; otherwise show 0
  const count = userCount.value ?? 0
  return count.toLocaleString()
}

const displayItemCount = () => {
  if (itemStore.isLoading && itemCount.value === 0) {
    return '...'
  }
  return itemCount.value.toLocaleString()
}

const displaySuccessfulBorrowsCount = () => {
  if (successfulBorrowsCount.value === null) {
    return '...'
  }
  return successfulBorrowsCount.value.toLocaleString()
}
</script>
