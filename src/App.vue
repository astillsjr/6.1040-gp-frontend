<template>
  <div id="app">
    <NavBar v-if="isAuthenticated" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { authService } from './services/auth'

const router = useRouter()
const isAuthenticated = computed(() => authService.isAuthenticated())
</script>

<style scoped>
.main-content {
  min-height: calc(100vh - 60px);
  padding-top: 60px;
}
</style>
