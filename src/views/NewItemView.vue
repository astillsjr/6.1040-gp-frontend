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
  padding: 48px 24px;
  min-height: calc(100vh - 70px);
  background: linear-gradient(to bottom, #F5F7FA 0%, #FFFFFF 100%);
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 42px;
  margin-bottom: 36px;
  color: #1A1A1A;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.item-form {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #E2E8F0;
}

.form-group {
  margin-bottom: 28px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #4A5568;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  transition: all 0.2s;
  background-color: #F7FAFC;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #2E7D32;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  display: block;
  margin-top: 6px;
  color: #718096;
  font-size: 13px;
}

.error-message {
  background-color: #FEE2E2;
  color: #A31F34;
  padding: 14px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
  border: 1px solid #FECACA;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid #E2E8F0;
}

.btn {
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 125, 50, 0.4);
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: white;
  color: #4A5568;
  border: 2px solid #E2E8F0;
}

.btn-secondary:hover {
  background-color: #F7FAFC;
  border-color: #CBD5E0;
}
</style>
