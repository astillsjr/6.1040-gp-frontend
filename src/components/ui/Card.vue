<template>
  <div
    data-slot="card"
    :class="cn('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border', ($attrs.class as string) || '')"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

