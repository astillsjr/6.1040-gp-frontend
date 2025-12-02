<template>
  <Card class="p-4 hover:shadow-md transition-shadow">
    <div class="flex gap-4">
      <!-- Item Image -->
      <div class="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
        <ImageWithFallback
          :src="itemImage"
          :alt="item.title"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 text-base">{{ item.title }}</h3>
            <p class="text-sm text-gray-600">{{ item.subtitle }}</p>
          </div>
          <Badge :variant="item.statusBadge.variant" class="ml-2">
            {{ item.statusBadge.text }}
          </Badge>
        </div>

        <!-- Time Info -->
        <div v-if="item.timeInfo" class="text-xs text-gray-500 mb-2">
          {{ item.timeInfo }}
        </div>

        <!-- Notes -->
        <div v-if="item.notes" class="bg-gray-50 p-2 rounded text-sm text-gray-700 mb-3">
          <strong>Note:</strong> {{ item.notes }}
        </div>

        <!-- Actions -->
        <div v-if="item.actions.length > 0" class="flex gap-2 flex-wrap">
          <Button
            v-for="(action, idx) in item.actions"
            :key="idx"
            size="sm"
            :variant="action.variant || 'default'"
            @click="action.handler"
          >
            {{ action.label }}
          </Button>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Card, Badge, Button } from '@/components/ui'
import ImageWithFallback from '@/components/ImageWithFallback.vue'
import * as itemListingAPI from '@/api/itemListing'

interface ActivityItem {
  id: string
  title: string
  subtitle: string
  statusBadge: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  timeInfo?: string
  notes?: string
  actions: Array<{
    label: string
    variant?: 'default' | 'outline' | 'destructive'
    handler: () => void
  }>
  rawData?: any
}

const props = defineProps<{
  item: ActivityItem
}>()

defineEmits<{
  action: [payload: { type: string; id: string; action: string }]
}>()

const itemImage = ref<string>(`https://via.placeholder.com/150?text=${encodeURIComponent(props.item.title)}`)
const isLoadingImage = ref(false)

// Extract item ID from rawData
const itemId = computed(() => {
  if (props.item.rawData) {
    const data = props.item.rawData
    // For requests: data.item (string ID)
    // For transactions: data.item (string ID)  
    // For listings: data.itemId (string ID)
    const id = data.item || data.itemId
    if (id && typeof id === 'string' && id.trim() !== '') {
      return id.trim()
    }
  }
  return null
})

async function fetchItemPhoto() {
  const placeholder = `https://via.placeholder.com/150?text=${encodeURIComponent(props.item.title)}`
  
  if (!itemId.value) {
    itemImage.value = placeholder
    return
  }

  isLoadingImage.value = true
  try {
    const photos = await itemListingAPI.getPhotosByItem({ item: itemId.value })
    if (photos && photos.length > 0) {
      // Sort by order and get first photo
      const sorted = photos.sort((a, b) => (a.order || 0) - (b.order || 0))
      const photoUrl = sorted[0].photoUrl
      if (photoUrl && photoUrl.trim() !== '') {
        itemImage.value = photoUrl
      } else {
        itemImage.value = placeholder
      }
    } else {
      // No photos found, use placeholder
      itemImage.value = placeholder
    }
  } catch (error) {
    console.error('Failed to fetch item photo for item:', itemId.value, error)
    // Keep placeholder on error
    itemImage.value = placeholder
  } finally {
    isLoadingImage.value = false
  }
}

// Watch for changes to itemId and rawData
watch([itemId, () => props.item.rawData], ([newId]) => {
  if (newId) {
    fetchItemPhoto()
  }
}, { immediate: true })

onMounted(() => {
  // Fetch photo on mount if itemId is available
  if (itemId.value) {
    fetchItemPhoto()
  }
})
</script>

