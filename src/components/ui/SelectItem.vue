<template>
  <option :value="value">
    <slot>{{ label || value }}</slot>
  </option>
</template>

<script setup lang="ts">
interface Props {
  value: string
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: undefined,
})
</script>

