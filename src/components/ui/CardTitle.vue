<template>
  <h4
    data-slot="card-title"
    :class="cn('leading-none', ($attrs.class as string) || '')"
    v-bind="$attrs"
  >
    <slot />
  </h4>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

