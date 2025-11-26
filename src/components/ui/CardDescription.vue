<template>
  <p
    data-slot="card-description"
    :class="cn('text-muted-foreground', ($attrs.class as string) || '')"
    v-bind="$attrs"
  >
    <slot />
  </p>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

