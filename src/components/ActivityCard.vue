<template>
  <Card class="p-6 hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 group relative overflow-hidden">
    <!-- Status indicator bar -->
    <div 
      class="absolute top-0 left-0 right-0 h-1"
      :class="getStatusBarColor(item.statusBadge.variant)"
    ></div>
    
    <div class="flex gap-5">
      <!-- Item Image -->
      <div class="flex-shrink-0 w-28 h-28 bg-muted rounded-xl overflow-hidden border-2 border-border group-hover:border-primary/30 transition-colors shadow-sm">
        <ImageWithFallback
          :src="itemImage"
          :alt="item.title"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <component 
                :is="getTypeIcon(item.type)" 
                class="w-5 h-5 shrink-0"
                :class="getTypeIconColor(item.type)"
              />
              <h3 class="font-semibold text-foreground text-lg truncate">{{ item.title }}</h3>
            </div>
            <p class="text-sm text-muted-foreground flex items-center gap-1.5">
              <component 
                :is="getSubtitleIcon(item.type, item.status)" 
                class="w-3.5 h-3.5"
              />
              <span>{{ item.subtitle }}</span>
            </p>
          </div>
          <Badge :variant="item.statusBadge.variant" class="ml-3 shrink-0 font-medium">
            {{ item.statusBadge.text }}
          </Badge>
        </div>

        <!-- Time Info -->
        <div v-if="item.timeInfo" class="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-muted/30 px-3 py-1.5 rounded-lg w-fit">
          <Clock class="w-3.5 h-3.5" />
          <span>{{ item.timeInfo }}</span>
        </div>

        <!-- Notes -->
        <div v-if="item.notes" class="bg-muted/50 border border-border rounded-lg p-3 text-sm text-foreground mb-4">
          <div class="flex items-start gap-2">
            <FileText class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div class="flex-1">
              <strong class="text-foreground font-medium">Note:</strong>
              <span class="text-muted-foreground ml-1">{{ item.notes }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="item.actions.length > 0" class="flex gap-2 flex-wrap pt-2 border-t border-border">
          <Button
            v-for="(action, idx) in item.actions"
            :key="idx"
            size="sm"
            :variant="action.variant || 'default'"
            class="rounded-lg font-medium"
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
import { Clock, FileText, Send, Package, List, ArrowRightLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-vue-next'
import { useItemListingStore } from '@/stores/itemListingStore'

interface ActivityItem {
  id: string
  type: 'incoming-request' | 'outgoing-request' | 'transaction' | 'listing'
  title: string
  subtitle: string
  status: string
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

const itemListingStore = useItemListingStore()
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
    const photos = await itemListingStore.getPhotosByItem(itemId.value)
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

// Helper functions for icons and colors
function getTypeIcon(type: string) {
  switch (type) {
    case 'incoming-request':
      return Send
    case 'outgoing-request':
      return Send
    case 'transaction':
      return ArrowRightLeft
    case 'listing':
      return List
    default:
      return Package
  }
}

function getTypeIconColor(type: string) {
  switch (type) {
    case 'incoming-request':
      return 'text-blue-600'
    case 'outgoing-request':
      return 'text-primary'
    case 'transaction':
      return 'text-green-600'
    case 'listing':
      return 'text-purple-600'
    default:
      return 'text-muted-foreground'
  }
}

function getSubtitleIcon(type: string, status: string) {
  if (status === 'PENDING' && type === 'outgoing-request') {
    return Clock
  }
  if (status === 'ACCEPTED') {
    return CheckCircle2
  }
  if (['REJECTED', 'CANCELLED'].includes(status)) {
    return XCircle
  }
  if (status === 'IN_PROGRESS') {
    return Package
  }
  return AlertCircle
}

function getStatusBarColor(variant: string) {
  switch (variant) {
    case 'default':
      return 'bg-primary'
    case 'secondary':
      return 'bg-secondary'
    case 'destructive':
      return 'bg-destructive'
    case 'outline':
      return 'bg-muted'
    default:
      return 'bg-border'
  }
}
</script>

