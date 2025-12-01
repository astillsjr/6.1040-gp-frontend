<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="max-w-6xl mx-auto px-4 py-12">
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to LocalLoop
        </h1>
        <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          MIT's Community Resource Sharing Platform. Borrow items from fellow students, share what you have, and build a more sustainable campus.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/items" class="inline-flex items-center justify-center gap-2 h-10 rounded-md px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all w-full sm:w-auto">
            <Search class="w-4 h-4" />
            Browse Items
          </router-link>
          <router-link
            v-if="authStore.isAuthenticated"
            to="/items/new"
            class="inline-flex items-center justify-center gap-2 h-10 rounded-md px-6 text-sm font-medium border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-all w-full sm:w-auto"
          >
            <Plus class="w-4 h-4" />
            List an Item
          </router-link>
          <router-link
            v-else
            to="/register"
            class="inline-flex items-center justify-center gap-2 h-10 rounded-md px-6 text-sm font-medium border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-all w-full sm:w-auto"
          >
            Get Started
          </router-link>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="max-w-6xl mx-auto px-4 py-12">
      <h2 class="text-2xl font-semibold text-gray-900 mb-8 text-center">
        How it works
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Find Items -->
        <Card class="p-6 text-center hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Search class="w-6 h-6 text-blue-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Find Items</h3>
          <p class="text-sm text-gray-600">
            Search for items you need from fellow MIT students
          </p>
        </Card>

        <!-- List Items -->
        <Card class="p-6 text-center hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Package class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">List Items</h3>
          <p class="text-sm text-gray-600">
            Share your unused items with the MIT community
          </p>
        </Card>

        <!-- Connect -->
        <Card class="p-6 text-center hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageSquare class="w-6 h-6 text-purple-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Connect</h3>
          <p class="text-sm text-gray-600">
            Coordinate borrows through in-app messaging
          </p>
        </Card>

        <!-- Earn Rewards -->
        <Card class="p-6 text-center hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Star class="w-6 h-6 text-yellow-600 fill-yellow-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Earn Rewards</h3>
          <p class="text-sm text-gray-600">
            Get rewarded for lending and helping the community
          </p>
        </Card>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="bg-white border-t border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-3xl font-bold text-gray-900 mb-2">500+</div>
            <p class="text-sm text-gray-600">Items Available</p>
          </div>
          <div>
            <div class="text-3xl font-bold text-gray-900 mb-2">200+</div>
            <p class="text-sm text-gray-600">Active Users</p>
          </div>
          <div>
            <div class="text-3xl font-bold text-gray-900 mb-2">1,000+</div>
            <p class="text-sm text-gray-600">Successful Borrows</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-gray-50 border-t border-gray-200">
      <div class="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          Ready to get started?
        </h2>
        <p class="text-gray-600 mb-6">
          Join the MIT community and start borrowing and sharing today.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            v-if="!authStore.isAuthenticated"
            to="/register"
            class="inline-flex items-center justify-center gap-2 h-10 rounded-md px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all w-full sm:w-auto"
          >
            Create Account
          </router-link>
          <router-link
            to="/items"
            class="inline-flex items-center justify-center gap-2 h-10 rounded-md px-6 text-sm font-medium border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-all w-full sm:w-auto"
          >
            Browse Items
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { Card } from '@/components/ui'
import { Search, Plus, Package, MessageSquare, Star } from 'lucide-vue-next'

const authStore = useAuthStore()
</script>
