<template>
  <div class="profile-view">
    <div class="container">
      <h1>My Profile</h1>
      
      <div v-if="loading" class="loading">Loading profile...</div>
      
      <div v-else-if="error" class="error">{{ error }}</div>
      
      <div v-else class="profile-content">
        <div class="profile-form">
          <h2>Profile Information</h2>
          <form @submit.prevent="handleUpdateProfile">
            <div class="form-group">
              <label for="displayName">Display Name</label>
              <input
                id="displayName"
                v-model="profile.displayName"
                type="text"
                placeholder="Your display name"
              />
            </div>
            <div class="form-group">
              <label for="dorm">Dorm</label>
              <select id="dorm" v-model="profile.dorm" required>
                <option value="">Select your dorm</option>
                <option v-for="dorm in validDorms" :key="dorm" :value="dorm">
                  {{ dorm }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="bio">Bio</label>
              <textarea
                id="bio"
                v-model="profile.bio"
                rows="4"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
            <button type="submit" :disabled="saving" class="btn btn-primary">
              {{ saving ? 'Saving...' : 'Save Profile' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userProfileAPI } from '../services/api'
import { authService } from '../services/auth'
import { VALID_DORMS } from '../utils/validDorms'

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const validDorms = VALID_DORMS
const profile = ref({
  displayName: '',
  dorm: '',
  bio: '',
})

onMounted(async () => {
  await loadProfile()
})

const loadProfile = async () => {
  try {
    loading.value = true
    const userId = authService.getCurrentUserId()
    if (!userId) {
      error.value = 'Not authenticated'
      return
    }

    const response = await userProfileAPI.getProfile({ user: userId })
    if (response.data.error) {
      // Profile might not exist yet, that's okay
      if (response.data.error.includes('does not have a profile')) {
        profile.value = { displayName: '', dorm: '', bio: '' }
        return
      }
      error.value = response.data.error
      return
    }

    const { displayName, dorm, bio } = response.data
    profile.value = { displayName, dorm, bio: bio || '' }
  } catch (err) {
    error.value = 'Failed to load profile'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleUpdateProfile = async () => {
  try {
    saving.value = true
    error.value = ''
    const userId = authService.getCurrentUserId()
    if (!userId) {
      error.value = 'Not authenticated'
      return
    }

    const response = await userProfileAPI.updateProfile({
      user: userId,
      displayName: profile.value.displayName,
      dorm: profile.value.dorm,
      bio: profile.value.bio,
    })

    if (response.data.error) {
      error.value = response.data.error
      return
    }

    // Profile updated successfully
    alert('Profile updated successfully!')
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to update profile'
    console.error(err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-view {
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

.profile-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-form h2 {
  margin-bottom: 24px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b983;
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

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #c33;
}
</style>
