<template>
  <div class="new-item-view">
    <div class="container">
      <h1>List a New Item</h1>
      
      <form @submit.prevent="handleSubmit" class="item-form">
        <div class="form-group">
          <label for="title">Item Title *</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            placeholder="e.g., Drill, HDMI Cable, Suit"
          />
        </div>
        
        <div class="form-group">
          <label for="description">Description *</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="4"
            required
            placeholder="Describe your item..."
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="category">Category *</label>
          <select id="category" v-model="formData.category" required>
            <option value="">Select a category</option>
            <option value="Tools">Tools</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Sports">Sports</option>
            <option value="Books">Books</option>
            <option value="Furniture">Furniture</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="condition">Condition *</label>
          <select id="condition" v-model="formData.condition" required>
            <option value="">Select condition</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="dormVisibility">Dorm Visibility *</label>
          <select id="dormVisibility" v-model="formData.dormVisibility" required>
            <option value="">Select visibility</option>
            <option value="ALL">All MIT Students</option>
            <option v-for="dorm in validDorms" :key="dorm" :value="dorm">
              {{ dorm }} only
            </option>
          </select>
          <small class="form-hint">Choose who can see this item</small>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$router.back()" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="btn btn-primary">
            {{ loading ? 'Creating...' : 'List Item' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { itemListingAPI } from '../services/api'
import { authService } from '../services/auth'
import { VALID_DORMS } from '../utils/validDorms'

const router = useRouter()

const loading = ref(false)
const error = ref('')
const validDorms = VALID_DORMS
const formData = ref({
  title: '',
  description: '',
  category: '',
  condition: '',
  dormVisibility: '',
})

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    const userId = authService.getCurrentUserId()
    if (!userId) {
      error.value = 'Not authenticated'
      loading.value = false
      return
    }

    // ItemListing.createItem requires: owner, title, description, category, condition, dormVisibility
    const result = await itemListingAPI.createItem({
      owner: userId,
      title: formData.value.title,
      description: formData.value.description,
      category: formData.value.category,
      condition: formData.value.condition,
      dormVisibility: formData.value.dormVisibility,
    })
    
    if (result.data.error) {
      error.value = result.data.error
    } else {
      router.push('/items')
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to create item. Please try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.new-item-view {
  padding: 40px 20px;
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 36px;
  margin-bottom: 30px;
  color: #2c3e50;
}

.item-form {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #42b983;
}

.form-hint {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 14px;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #35a372;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d0d0d0;
}
</style>
