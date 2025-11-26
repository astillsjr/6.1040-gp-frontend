<template>
  <div
    data-slot="card-content"
    :class="cn('px-6 [&:last-child]:pb-6', ($attrs.class as string) || '')"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

