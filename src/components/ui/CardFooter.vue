<template>
  <div
    data-slot="card-footer"
    :class="cn('flex items-center px-6 pb-6 [.border-t]:pt-6', ($attrs.class as string) || '')"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

