<template>
  <label
    :for="forAttr"
    :class="
      cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )
    "
  >
    <slot />
  </label>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

const attrs = useAttrs()
const forAttr = computed(() => attrs.for as string | undefined)
const className = computed(() => (attrs.class as string) || '')
</script>

