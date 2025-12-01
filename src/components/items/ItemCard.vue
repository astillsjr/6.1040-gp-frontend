<template>
  <div
    @click="$emit('click')"
    class="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-sustainable-lg transition-all duration-300 cursor-pointer border border-border hover:border-primary/30 group"
  >
    <div class="aspect-[4/3] relative overflow-hidden bg-muted">
      <ImageWithFallback
        :src="item.image"
        :alt="item.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
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

