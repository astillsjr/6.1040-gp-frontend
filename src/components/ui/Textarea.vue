<template>
  <textarea
    :class="
      cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-input-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
        ($attrs.class as string) || ''
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </textarea>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

