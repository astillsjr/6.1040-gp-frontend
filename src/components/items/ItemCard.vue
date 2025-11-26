<template>
  <div
    @click="$emit('click')"
    class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
  >
    <div class="aspect-[4/3] relative overflow-hidden bg-gray-100">
      <ImageWithFallback
        :src="item.image"
        :alt="item.name"
        class="w-full h-full object-cover"
      />
    </div>
    <div class="p-4">
      <div class="flex items-start justify-between gap-2 mb-2">
        <h3 class="flex-1">{{ item.name }}</h3>
        <Badge variant="outline" class="text-xs text-gray-700 border-gray-300 bg-transparent">
          {{ item.condition }}
        </Badge>
      </div>
      <div class="flex items-center gap-1 text-sm text-gray-600 mb-2">
        <MapPin class="w-4 h-4" />
        <span>{{ item.dorm }}</span>
      </div>
      <div class="flex items-center gap-2">
        <img
          :src="item.owner.avatar"
          :alt="item.owner.name"
          class="w-6 h-6 rounded-full"
        />
        <span class="text-sm text-gray-600">{{ item.owner.name }}</span>
        <div class="flex items-center gap-1 ml-auto">
          <Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span class="text-sm">{{ item.owner.rating }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui'
import ImageWithFallback from '@/components/ImageWithFallback.vue'
import { MapPin, Star } from 'lucide-vue-next'

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

