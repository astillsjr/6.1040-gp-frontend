<template>
  <div
    v-if="isActive"
    class="tabs-content"
    role="tabpanel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isActive?: boolean
}>()

defineOptions({
  name: 'TabsContent',
})
</script>

<style scoped>
.tabs-content {
  padding-top: 1.5rem;
}
</style>

