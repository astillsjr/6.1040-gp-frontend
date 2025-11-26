<template>
  <div class="base-card">
    <slot />
  </div>
</template>

<script setup lang="ts">
// TODO: Add props for variants, padding, etc.
// TODO: Use design tokens from useDesignTokens composable
</script>

<style scoped>
.base-card {
  padding: 1rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>

