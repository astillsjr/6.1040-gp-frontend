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

.profile-content {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #E2E8F0;
}

.profile-form h2 {
  margin-bottom: 32px;
  color: #1A1A1A;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.3px;
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

.btn {
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
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

.loading,
.error {
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
}

.loading {
  color: #4A5568;
}

.error {
  color: #A31F34;
  background-color: #FEE2E2;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #FECACA;
}
</style>
