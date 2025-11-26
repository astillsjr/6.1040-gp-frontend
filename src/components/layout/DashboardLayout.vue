<template>
  <div class="dashboard-layout">
    <AppNavigation />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNavigation from './AppNavigation.vue'
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
}

.main-content {
  padding-top: 70px; /* Adjust based on navbar height */
}
</style>

