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
          <router-link
            v-if="authStore.isAuthenticated"
            to="/items"
            class="inline-flex items-center justify-center gap-2 h-12 rounded-xl px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-recycling-green-dark transition-all shadow-sustainable hover:shadow-sustainable-lg transform hover:-translate-y-0.5 w-full sm:w-auto"
          >
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
          <template v-else>
            <router-link
              to="/register"
              class="inline-flex items-center justify-center gap-2 h-12 rounded-xl px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-recycling-green-dark transition-all shadow-sustainable hover:shadow-sustainable-lg transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Get Started
            </router-link>
            <router-link
              to="/items"
              class="inline-flex items-center justify-center gap-2 h-12 rounded-xl px-8 text-base font-semibold border-2 border-primary/20 bg-card text-foreground hover:bg-recycling-green-pale hover:border-primary/40 transition-all w-full sm:w-auto"
            >
              <Search class="w-5 h-5" />
              Browse Items
            </router-link>
          </template>
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
          <p class="text-sm text-muted-foreground leading-relaxed mb-2">
            Get rewarded for lending and helping the community
          </p>
          <p class="text-xs text-muted-foreground italic">
            Reach 500 points to unlock rewards
          </p>
        </Card>
      </div>
    </div>

    <!-- Featured Items Section -->
    <div v-if="featuredItems.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Featured Items
          </h2>
          <p class="text-lg text-muted-foreground">
            Discover items available in your community
          </p>
        </div>
        <router-link
          to="/items"
          class="hidden sm:inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View All
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ItemCard
          v-for="item in featuredItems"
          :key="item.id"
          :item="item"
          @click="handleItemClick(item.id)"
        />
      </div>
      <div class="mt-8 text-center sm:hidden">
        <router-link
          to="/items"
          class="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View All Items
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="bg-card border-t border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <!-- Items Available -->
          <div class="space-y-2">
            <div class="flex items-center justify-center gap-3 mb-2">
              <Package class="w-6 h-6 text-primary opacity-70" />
              <div class="text-4xl sm:text-5xl font-bold text-primary">
                <template v-if="itemStore.isLoading && itemCount === 0">
                  <div class="inline-block w-16 h-12 bg-muted rounded-lg animate-pulse"></div>
                </template>
                <template v-else>
                  {{ displayItemCount() }}
                </template>
              </div>
            </div>
            <p class="text-base text-muted-foreground font-medium">Items Available</p>
          </div>
          
          <!-- Active Users -->
          <div class="space-y-2">
            <div class="flex items-center justify-center gap-3 mb-2">
              <svg class="w-6 h-6 text-primary opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div class="text-4xl sm:text-5xl font-bold text-primary">
                <template v-if="isLoading && userCount === null">
                  <div class="inline-block w-16 h-12 bg-muted rounded-lg animate-pulse"></div>
                </template>
                <template v-else>
                  {{ displayUserCount() }}
                </template>
              </div>
            </div>
            <p class="text-base text-muted-foreground font-medium">Active Users</p>
          </div>
          
          <!-- Successful Borrows -->
          <div class="space-y-2">
            <div class="flex items-center justify-center gap-3 mb-2">
              <svg class="w-6 h-6 text-primary opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-4xl sm:text-5xl font-bold text-primary">
                <template v-if="successfulBorrowsCount === null">
                  <div class="inline-block w-16 h-12 bg-muted rounded-lg animate-pulse"></div>
                </template>
                <template v-else>
                  {{ displaySuccessfulBorrowsCount() }}
                </template>
              </div>
            </div>
            <p class="text-base text-muted-foreground font-medium">Successful Borrows</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useItemStore } from '@/stores/itemStore'
import { Card } from '@/components/ui'
import ItemCard from '@/components/items/ItemCard.vue'
import { Search, Plus, Package, MessageSquare, Star } from 'lucide-vue-next'
import { getUserCount } from '@/api/auth'
import { getSuccessfulBorrowsCount } from '@/api/itemTransaction'
import type { DisplayItem } from '@/stores/itemStore'

const router = useRouter()
const authStore = useAuthStore()
const itemStore = useItemStore()
const userCount = ref<number | null>(null)
const successfulBorrowsCount = ref<number | null>(null)
const isLoading = ref(true)

// Use the itemStore's items count to match what's shown on the browse items page
const itemCount = computed(() => itemStore.items.length)

// Featured items - show first 8 available items
const featuredItems = computed<DisplayItem[]>(() => {
  return itemStore.items
    .filter(item => item.listingStatus === 'AVAILABLE')
    .slice(0, 8)
})

const handleItemClick = (itemId: string) => {
  router.push(`/items/${itemId}`)
}

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
