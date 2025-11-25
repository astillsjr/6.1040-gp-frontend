<template>
  <div class="items-view">
    <div class="container">
      <div class="header">
        <h1>Browse Items</h1>
        <router-link 
          v-if="isAuthenticated" 
          to="/items/new" 
          class="btn btn-primary"
        >
          + List New Item
        </router-link>
        <router-link 
          v-else 
          to="/login" 
          class="btn btn-primary"
        >
          + List New Item
        </router-link>
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
        <p>No items found.</p>
        <p v-if="isAuthenticated" style="margin-top: 8px;">
          <router-link to="/items/new" class="btn btn-primary" style="display: inline-block;">
            Be the first to list an item!
          </router-link>
        </p>
        <p v-else style="margin-top: 8px; color: #718096;">
          <router-link to="/register">Sign up</router-link> to list items and borrow from the community.
        </p>
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
              <button 
                v-if="isAuthenticated" 
                @click="handleBorrow(item)" 
                class="btn-borrow"
              >
                Borrow
              </button>
              <router-link 
                v-else 
                to="/login" 
                class="btn-borrow"
              >
                Login to Borrow
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { itemListingAPI } from '../services/api'
import { authService } from '../services/auth'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const items = ref([])
const searchQuery = ref('')

const isAuthenticated = computed(() => authService.isAuthenticated())

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

const handleBorrow = (item) => {
  if (!isAuthenticated.value) {
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  // TODO: Implement borrow functionality
  console.log('Borrow item:', item)
  alert('Borrow functionality coming soon!')
}
</script>

<style scoped>
.items-view {
  padding: 48px 24px;
  min-height: calc(100vh - 70px);
  background: linear-gradient(to bottom, #F5F7FA 0%, #FFFFFF 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 36px;
  flex-wrap: wrap;
  gap: 16px;
}

.header h1 {
  font-size: 42px;
  color: #1A1A1A;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.search-section {
  margin-bottom: 36px;
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: 14px 20px;
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  font-size: 16px;
  background-color: white;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1), 0 4px 8px rgba(0, 0, 0, 0.08);
}

.btn {
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 125, 50, 0.4);
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 28px;
}

.item-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #E2E8F0;
  cursor: pointer;
}

.item-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(46, 125, 50, 0.15);
  border-color: #2E7D32;
}

.item-image {
  width: 100%;
  height: 220px;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72px;
  position: relative;
  overflow: hidden;
}

.item-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, transparent 100%);
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 1;
}

.item-content {
  padding: 24px;
}

.item-content h3 {
  font-size: 22px;
  margin-bottom: 10px;
  color: #1A1A1A;
  font-weight: 600;
}

.item-category {
  color: #2E7D32;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-description {
  color: #4A5568;
  margin-bottom: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
  font-size: 15px;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.item-status {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  color: #2E7D32;
  text-transform: capitalize;
}

.btn-borrow {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
}

.btn-borrow:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.4);
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 80px 20px;
  font-size: 18px;
  color: #4A5568;
}

.error {
  color: #A31F34;
  background-color: #FEE2E2;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #FECACA;
  max-width: 600px;
  margin: 0 auto;
}
</style>
