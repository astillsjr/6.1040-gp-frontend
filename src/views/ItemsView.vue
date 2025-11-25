<template>
  <div class="items-view">
    <div class="container">
      <div class="header">
        <h1>Browse Items</h1>
        <router-link to="/items/new" class="btn btn-primary">+ List New Item</router-link>
      </div>
      
      <div class="search-section">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search items..."
          class="search-input"
        />
      </div>
      
      <div v-if="loading" class="loading">Loading items...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="items.length === 0" class="empty-state">
        <p>No items found. Be the first to list an item!</p>
      </div>
      <div v-else class="items-grid">
        <div v-for="item in items" :key="item._id" class="item-card">
          <div class="item-image">
            <span v-if="!item.photoUrl">📦</span>
            <img v-else :src="item.photoUrl" :alt="item.title" />
          </div>
          <div class="item-content">
            <h3>{{ item.title }}</h3>
            <p class="item-category">{{ item.category }}</p>
            <p class="item-description">{{ item.description }}</p>
            <div class="item-footer">
              <span class="item-status">{{ item.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { itemListingAPI } from '../services/api'

const loading = ref(true)
const error = ref('')
const items = ref([])
const searchQuery = ref('')

onMounted(async () => {
  await loadItems()
})

watch(searchQuery, () => {
  loadItems()
})

const loadItems = async () => {
  try {
    loading.value = true
    error.value = ''
    // This will need to be implemented based on ItemListing.searchItems API
    // For now, showing placeholder
    items.value = []
    error.value = 'Item search not yet fully implemented'
  } catch (err) {
    error.value = 'Failed to load items'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.items-view {
  padding: 40px 20px;
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 36px;
  color: #2c3e50;
}

.search-section {
  margin-bottom: 30px;
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
}

.search-input:focus {
  outline: none;
  border-color: #42b983;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:hover {
  background-color: #35a372;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.item-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.item-image {
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-content {
  padding: 20px;
}

.item-content h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #2c3e50;
}

.item-category {
  color: #42b983;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.item-description {
  color: #666;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #e0e0e0;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
  color: #666;
}

.error {
  color: #c33;
}
</style>
