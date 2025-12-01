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

          <div v-if="selectedDate && availableTimeSlots.length > 0">
            <p class="text-sm text-gray-600 mb-3 flex items-center gap-2">
              <Clock class="w-4 h-4" />
              Available pickup times for {{ formatDate(selectedDate) }}
            </p>
            <div class="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              <Button
                v-for="(slot, idx) in availableTimeSlots"
                :key="idx"
                variant="outline"
                class="justify-start text-sm"
                :class="{ 'bg-gray-900 text-white': selectedTimeSlot === idx }"
                @click="selectedTimeSlot = idx"
              >
                {{ slot.label }}
              </Button>
            </div>
          </div>

          <div v-else-if="selectedDate && availableTimeSlots.length === 0" class="text-sm text-gray-500">
            No available time slots for this date.
          </div>
        </div>

        <!-- Request Notes -->
        <div class="mb-6">
          <h2 class="mb-3 text-lg font-semibold">Add a Note (Optional)</h2>
          <Card class="p-4">
            <Textarea
              v-model="requestNotes"
              placeholder="e.g., 'I need this for a class project due Friday' or 'Can we meet at the Student Center?'"
              rows="3"
              class="w-full"
            />
            <p class="text-sm text-muted-foreground mt-2">
              Help coordinate pickup details or explain why you need this item
            </p>
          </Card>
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
import { Button, Badge, Card, Textarea } from '@/components/ui'
import ImageWithFallback from '@/components/ImageWithFallback.vue'
import { ArrowLeft, MapPin, Star, Clock, Calendar as CalendarIcon } from 'lucide-vue-next'
import * as itemListingAPI from '@/api/itemListing'
import * as itemRequestingAPI from '@/api/itemRequesting'
import type { AvailabilityWindow } from '@/api/itemListing'

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const authStore = useAuthStore()

interface TimeSlot {
  label: string
  startTime: Date
  endTime: Date
  window: AvailabilityWindow
}

const selectedDate = ref<string>('')
const selectedTimeSlot = ref<number | null>(null)
const availableWindows = ref<AvailabilityWindow[]>([])
const availableTimeSlots = ref<TimeSlot[]>([])
const requestNotes = ref<string>('')

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const canRequest = computed(() => {
  return (
    authStore.isAuthenticated &&
    selectedDate.value &&
    selectedTimeSlot.value !== null &&
    availableTimeSlots.value.length > 0
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
    generateTimeSlots(newDate)
    selectedTimeSlot.value = null
  } else {
    availableWindows.value = []
    availableTimeSlots.value = []
  }
})

async function fetchAvailabilityWindows(itemId: string, date?: string) {
  try {
    const windows = await itemListingAPI.getAvailabilityByItem({ item: itemId })
    
    if (date) {
      // Filter windows for selected date - show windows that span across the selected date
      // Parse date string manually to avoid timezone issues
      const [year, month, day] = date.split('-').map(Number)
      const selectedDateStart = new Date(year, month - 1, day, 0, 0, 0, 0)
      const selectedDateEnd = new Date(year, month - 1, day, 23, 59, 59, 999)
      
      availableWindows.value = windows.filter((window) => {
        const windowStart = new Date(window.startTime)
        const windowEnd = new Date(window.endTime)
        
        // Show the window if the selected date falls within the window's range
        // OR if the window starts/ends on the selected date
        return (
          window.status === 'AVAILABLE' &&
          windowStart <= selectedDateEnd &&
          windowEnd >= selectedDateStart
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
  // Parse the date string manually to avoid timezone conversion issues
  // Date input gives us "YYYY-MM-DD", we want to treat this as local date
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month is 0-indexed in Date constructor
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Generates hourly time slots for the selected date based on available windows
 */
function generateTimeSlots(dateString: string) {
  const slots: TimeSlot[] = []
  
  if (availableWindows.value.length === 0) {
    availableTimeSlots.value = []
    return
  }

  const [year, month, day] = dateString.split('-').map(Number)
  const selectedDateObj = new Date(year, month - 1, day)
  
  for (const window of availableWindows.value) {
    const windowStart = new Date(window.startTime)
    const windowEnd = new Date(window.endTime)
    
    const windowStartDate = new Date(windowStart.getFullYear(), windowStart.getMonth(), windowStart.getDate())
    const windowEndDate = new Date(windowEnd.getFullYear(), windowEnd.getMonth(), windowEnd.getDate())
    
    // Determine the time range available on the selected date
    let dayStartTime: Date
    let dayEndTime: Date
    
    if (windowStartDate.getTime() === selectedDateObj.getTime()) {
      // Selected date is the start date - use actual start time
      dayStartTime = new Date(windowStart)
    } else {
      // Selected date is after start date - start at midnight
      dayStartTime = new Date(year, month - 1, day, 0, 0, 0)
    }
    
    if (windowEndDate.getTime() === selectedDateObj.getTime()) {
      // Selected date is the end date - use actual end time
      dayEndTime = new Date(windowEnd)
    } else {
      // Selected date is before end date - end at 11:59 PM
      dayEndTime = new Date(year, month - 1, day, 23, 59, 59)
    }
    
    // Generate 2-hour time slots aligned to 30-minute intervals
    const slotDuration = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
    let currentSlotStart = new Date(dayStartTime)
    
    // Round to nearest 30-minute interval
    const minutes = currentSlotStart.getMinutes()
    const seconds = currentSlotStart.getSeconds()
    const milliseconds = currentSlotStart.getMilliseconds()
    
    if (seconds > 0 || milliseconds > 0 || (minutes !== 0 && minutes !== 30)) {
      // Round up to next 30-minute mark
      if (minutes < 30) {
        currentSlotStart.setMinutes(30, 0, 0)
      } else {
        currentSlotStart.setHours(currentSlotStart.getHours() + 1, 0, 0, 0)
      }
    }
    
    while (currentSlotStart < dayEndTime) {
      const slotEnd = new Date(currentSlotStart.getTime() + slotDuration)
      
      // Make sure slot end doesn't exceed the day's available end time
      const actualSlotEnd = slotEnd > dayEndTime ? new Date(dayEndTime) : slotEnd
      
      // Only add slot if it's at least 1 hour long
      if (actualSlotEnd.getTime() - currentSlotStart.getTime() >= 60 * 60 * 1000) {
        const startTimeStr = currentSlotStart.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        const endTimeStr = actualSlotEnd.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        
        slots.push({
          label: `${startTimeStr} - ${endTimeStr}`,
          startTime: new Date(currentSlotStart),
          endTime: new Date(actualSlotEnd),
          window: window,
        })
      }
      
      currentSlotStart = new Date(slotEnd)
    }
  }
  
  availableTimeSlots.value = slots
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
    const selectedSlot = availableTimeSlots.value[selectedTimeSlot.value]
    
    await itemRequestingAPI.createRequest({
      requester: authStore.userId!,
      item: itemStore.currentItem.id,
      type: 'BORROW',
      status: 'PENDING',
      requesterNotes: requestNotes.value.trim(),
      requestedStartTime: selectedSlot.startTime,
      requestedEndTime: selectedSlot.endTime,
    })

    // Show success message and navigate
    alert('Request submitted successfully! Check "Activity" to track its status.')
    router.push({ name: 'Items' })
  } catch (error) {
    console.error('Failed to create request:', error)
    alert('Failed to submit request. Please try again.')
  }
}
</script>

