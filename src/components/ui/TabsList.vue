<template>
  <div class="tabs-list border-b border-border" role="tablist">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'TabsList',
})
</script>

<style scoped>
.tabs-list {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-list::-webkit-scrollbar {
  display: none;
}
</style>

