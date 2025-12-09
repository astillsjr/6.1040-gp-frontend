<template>
  <div id="app">
    <NavBar />
    <Toast />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import { Toast } from './components/ui'
</script>

<style scoped>
.main-content {
  min-height: calc(100vh - 72px);
  padding-top: 72px;
}
</style>
