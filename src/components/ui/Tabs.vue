<template>
  <div class="tabs-container">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'Tabs',
})
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>

