<template>
  <button
    :class="[
      'tabs-trigger',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      isActive 
        ? 'text-foreground border-b-2 border-primary font-semibold' 
        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
    ]"
    @click="$emit('click')"
    :aria-selected="isActive"
    role="tab"
    type="button"
  >
    <slot />
    <Badge
      v-if="badgeCount !== undefined && badgeCount > 0"
      variant="secondary"
      class="ml-2 h-5 min-w-[20px] flex items-center justify-center text-xs"
    >
      {{ badgeCount > 9 ? '9+' : badgeCount }}
    </Badge>
  </button>
</template>

<script setup lang="ts">
import Badge from './Badge.vue'

defineProps<{
  isActive?: boolean
  badgeCount?: number
}>()

defineEmits<{
  click: []
}>()

defineOptions({
  name: 'TabsTrigger',
})
</script>

<style scoped>
.tabs-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
</style>

