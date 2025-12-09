<template>
  <div
    @click="$emit('click')"
    class="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-sustainable-lg transition-all duration-300 cursor-pointer border border-border hover:border-primary/30 group relative"
  >
    <div class="aspect-[4/3] relative overflow-hidden bg-muted">
      <ImageWithFallback
        :src="item.image"
        :alt="item.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <!-- Unauthenticated User Badge -->
      <div
        v-if="!isAuthenticated"
        class="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Sign up to request
      </div>
    </div>
    <div class="p-5">
      <div class="flex items-start justify-between gap-2 mb-3">
        <h3 class="flex-1 font-semibold text-foreground text-base leading-tight">{{ item.name }}</h3>
        <Badge variant="outline" class="text-xs text-muted-foreground border-border bg-muted/50 shrink-0">
          {{ item.condition }}
        </Badge>
      </div>
      <div class="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
        <MapPin class="w-4 h-4 text-primary" />
        <span>{{ item.dorm }}</span>
      </div>
      <div class="flex items-center gap-2.5 pt-3 border-t border-border">
        <img
          :src="item.owner.avatar"
          :alt="item.owner.name"
          class="w-7 h-7 rounded-full border-2 border-border"
        />
        <span class="text-sm text-foreground font-medium flex-1">{{ item.owner.name }}</span>
        <div class="flex items-center gap-1">
          <Star class="w-4 h-4 fill-recycling-green text-recycling-green" />
          <span class="text-sm font-medium text-foreground">{{ item.owner.rating }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { Badge } from '@/components/ui'
import ImageWithFallback from '@/components/ImageWithFallback.vue'
import { MapPin, Star } from 'lucide-vue-next'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

export interface Item {
  id: string
  name: string
  category: string
  image: string
  condition: 'Like New' | 'Good' | 'Fair'
  description: string
  owner: {
    id: string
    name: string
    avatar?: string
    rating: number
  }
  dorm: string
  pickupLocation: string
  tags: string[]
  availableFrom?: Date
  availableUntil?: Date
}

interface Props {
  item: Item
}

defineProps<Props>()
defineEmits<{
  click: []
}>()
</script>

