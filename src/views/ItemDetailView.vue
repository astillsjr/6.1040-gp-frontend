<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <Button variant="ghost" @click="handleBack" class="mb-2">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="itemStore.isLoading" class="max-w-4xl mx-auto px-4 py-12 text-center">
      <p class="text-gray-500">Loading item details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="itemStore.error || !itemStore.currentItem" class="max-w-4xl mx-auto px-4 py-12 text-center">
      <p class="text-red-500 mb-4">{{ itemStore.error || 'Item not found' }}</p>
      <Button variant="outline" @click="handleBack">Go Back</Button>
    </div>

    <!-- Content -->
    <template v-else>
      <div class="max-w-4xl mx-auto px-4 py-6 pb-24">
        <!-- Item Image -->
        <div class="aspect-[16/10] w-full rounded-lg overflow-hidden bg-gray-100 mb-6">
          <ImageWithFallback
            :src="itemStore.currentItem.image"
            :alt="itemStore.currentItem.name"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Item Info -->
        <div class="mb-6">
          <div class="flex items-start justify-between gap-4 mb-3">
            <h1 class="text-gray-900 text-2xl font-semibold">{{ itemStore.currentItem.name }}</h1>
            <Badge variant="outline" class="text-gray-700 border-gray-300 bg-transparent">{{ itemStore.currentItem.condition }}</Badge>
          </div>

          <div class="flex items-center gap-4 mb-4 flex-wrap">
            <Badge variant="secondary">{{ itemStore.currentItem.category }}</Badge>
            <Badge
              v-for="tag in itemStore.currentItem.tags.slice(0, 2)"
              :key="tag"
              variant="outline"
              class="text-xs"
            >
              {{ tag }}
            </Badge>
          </div>

          <p class="text-gray-600 mb-4">{{ itemStore.currentItem.description }}</p>

          <!-- Location -->
          <Card class="p-4 mb-4">
            <div class="flex items-start gap-3">
              <MapPin class="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p class="text-sm text-gray-600">Pickup Location</p>
                <p class="font-medium">{{ itemStore.currentItem.pickupLocation }}</p>
                <p class="text-sm text-gray-500">{{ itemStore.currentItem.dorm }}</p>
              </div>
            </div>
          </Card>

          <!-- Owner Info -->
          <Card class="p-4">
            <div class="flex items-center gap-3">
              <img
                :src="itemStore.currentItem.owner.avatar"
                :alt="itemStore.currentItem.owner.name"
                class="w-12 h-12 rounded-full"
              />
              <div class="flex-1">
                <p class="font-medium">{{ itemStore.currentItem.owner.name }}</p>
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-1">
                    <Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span class="text-sm">{{ itemStore.currentItem.owner.rating }}</span>
                  </div>
                  <span class="text-sm text-gray-500">·</span>
                  <span class="text-sm text-gray-500">{{ itemStore.currentItem.dorm }}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Availability Section -->
        <div class="mb-6">
          <h2 class="mb-3 flex items-center gap-2 text-lg font-semibold">
            <CalendarIcon class="w-5 h-5" />
            Check Availability
          </h2>

          <Card class="p-4 mb-4">
            <div class="mb-4">
              <label class="text-sm text-gray-600 mb-2 block">Select Date</label>
              <input
                v-model="selectedDate"
                type="date"
                :min="minDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </Card>

          <div v-if="selectedDate && availableWindows.length > 0">
            <p class="text-sm text-gray-600 mb-3 flex items-center gap-2">
              <Clock class="w-4 h-4" />
              Available time slots for {{ formatDate(selectedDate) }}
            </p>
            <div class="grid grid-cols-2 gap-2">
              <Button
                v-for="(window, idx) in availableWindows"
                :key="idx"
                variant="outline"
                class="justify-start"
                :class="{ 'bg-gray-900 text-white': selectedTimeSlot === idx }"
                @click="selectedTimeSlot = idx"
              >
                {{ formatTimeWindow(window) }}
              </Button>
            </div>
          </div>

          <div v-else-if="selectedDate && availableWindows.length === 0" class="text-sm text-gray-500">
            No available time slots for this date.
          </div>
        </div>
      </div>

      <!-- Fixed Bottom Bar -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div class="max-w-4xl mx-auto">
          <Button
            class="w-full bg-gray-900 text-white hover:bg-gray-800"
            size="lg"
            :disabled="!canRequest"
            @click="handleRequestBorrow"
          >
            Request to Borrow
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { useAuthStore } from '@/stores/authStore'
import { Button, Badge, Card } from '@/components/ui'
import ImageWithFallback from '@/components/ImageWithFallback.vue'
import { ArrowLeft, MapPin, Star, Clock, Calendar as CalendarIcon } from 'lucide-vue-next'
import * as itemListingAPI from '@/api/itemListing'
import * as itemRequestingAPI from '@/api/itemRequesting'
import type { AvailabilityWindow } from '@/api/itemListing'

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const authStore = useAuthStore()

const selectedDate = ref<string>('')
const selectedTimeSlot = ref<number | null>(null)
const availableWindows = ref<AvailabilityWindow[]>([])

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const canRequest = computed(() => {
  return (
    authStore.isAuthenticated &&
    selectedDate.value &&
    selectedTimeSlot.value !== null &&
    availableWindows.value.length > 0
  )
})

// Fetch item on mount
onMounted(async () => {
  const itemId = route.params.id as string
  if (itemId) {
    try {
      await itemStore.fetchItemById(itemId)
      // Fetch availability windows for the item
      await fetchAvailabilityWindows(itemId)
    } catch (error) {
      console.error('Failed to fetch item:', error)
    }
  }
})

// Watch selected date and fetch availability
watch(selectedDate, async (newDate) => {
  if (newDate && itemStore.currentItem) {
    await fetchAvailabilityWindows(itemStore.currentItem.id, newDate)
    selectedTimeSlot.value = null
  } else {
    availableWindows.value = []
  }
})

async function fetchAvailabilityWindows(itemId: string, date?: string) {
  try {
    const windows = await itemListingAPI.getAvailabilityByItem({ item: itemId })
    
    if (date) {
      // Filter windows for selected date
      const selected = new Date(date + 'T00:00:00') // Add time to avoid timezone issues
      availableWindows.value = windows.filter((window) => {
        const windowDate = new Date(window.startTime)
        const windowDateOnly = new Date(windowDate.getFullYear(), windowDate.getMonth(), windowDate.getDate())
        const selectedDateOnly = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate())
        return (
          windowDateOnly.getTime() === selectedDateOnly.getTime() &&
          window.status === 'AVAILABLE'
        )
      })
    } else {
      // Show all available windows
      availableWindows.value = windows.filter((w) => w.status === 'AVAILABLE')
    }
  } catch (error) {
    console.error('Failed to fetch availability windows:', error)
    availableWindows.value = []
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTimeWindow(window: AvailabilityWindow): string {
  const start = new Date(window.startTime)
  const end = new Date(window.endTime)
  
  const startTime = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const endTime = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  
  return `${startTime} - ${endTime}`
}

function handleBack() {
  router.back()
}

async function handleRequestBorrow() {
  if (!authStore.isAuthenticated || !itemStore.currentItem || selectedTimeSlot.value === null) {
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }

  try {
    const selectedWindow = availableWindows.value[selectedTimeSlot.value]
    
    await itemRequestingAPI.createRequest({
      requester: authStore.userId!,
      item: itemStore.currentItem.id,
      type: 'BORROW',
      status: 'PENDING',
      requesterNotes: '',
      requestedStartTime: new Date(selectedWindow.startTime),
      requestedEndTime: new Date(selectedWindow.endTime),
    })

    // Show success message and navigate
    alert('Request submitted successfully!')
    router.push({ name: 'Items' })
  } catch (error) {
    console.error('Failed to create request:', error)
    alert('Failed to submit request. Please try again.')
  }
}
</script>

