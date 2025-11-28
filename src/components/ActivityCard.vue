<template>
  <Card class="p-4 hover:shadow-md transition-shadow">
    <div class="flex gap-4">
      <!-- Item Image -->
      <div class="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
        <img
          :src="`https://via.placeholder.com/150?text=${encodeURIComponent(item.title)}`"
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
import { Card, Badge, Button } from '@/components/ui'

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
}

defineProps<{
  item: ActivityItem
}>()

defineEmits<{
  action: [payload: { type: string; id: string; action: string }]
}>()
</script>

