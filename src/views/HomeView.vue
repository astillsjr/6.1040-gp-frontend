<template>
  <div class="home-view">
    <div class="hero-section">
      <h1>Welcome to LocalLoop</h1>
      <p class="subtitle">MIT's Community Resource Sharing Platform</p>
      <div class="cta-buttons">
        <router-link to="/items" class="btn btn-primary">Browse Items</router-link>
        <router-link 
          v-if="isAuthenticated" 
          to="/items/new" 
          class="btn btn-secondary"
        >
          List an Item
        </router-link>
        <router-link 
          v-else 
          to="/register" 
          class="btn btn-secondary"
        >
          Get Started
        </router-link>
      </div>
    </div>
    
    <div class="features-section">
      <div class="container">
        <h2>How it works</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Find Items</h3>
            <p>Search for items you need from fellow MIT students</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📦</div>
            <h3>List Items</h3>
            <p>Share your unused items with the MIT community</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤝</div>
            <h3>Connect</h3>
            <p>Coordinate borrows and builds through in-app messaging</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⭐</div>
            <h3>Earn Rewards</h3>
            <p>Get rewarded for lending and helping the community</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { authService } from '../services/auth'

const isAuthenticated = computed(() => authService.isAuthenticated())
</script>

<style scoped>
.home-view {
  min-height: calc(100vh - 70px);
}

.hero-section {
  background: linear-gradient(135deg, #A31F34 0%, #8A1538 100%);
  color: white;
  padding: 100px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(46, 125, 50, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(46, 125, 50, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-section h1 {
  font-size: 56px;
  margin-bottom: 20px;
  font-weight: 700;
  letter-spacing: -1px;
  position: relative;
  z-index: 1;
}

.subtitle {
  font-size: 22px;
  margin-bottom: 48px;
  opacity: 0.95;
  font-weight: 400;
  position: relative;
  z-index: 1;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.btn {
  padding: 16px 36px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:hover::before {
  width: 300px;
  height: 300px;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.btn-primary {
  background-color: #2E7D32;
  color: white;
  border: 2px solid #2E7D32;
  position: relative;
  z-index: 1;
}

.btn-primary:hover {
  background-color: #1B5E20;
  border-color: #1B5E20;
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
  position: relative;
  z-index: 1;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.features-section {
  padding: 100px 20px;
  background: linear-gradient(to bottom, #F5F7FA 0%, #FFFFFF 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-section h2 {
  text-align: center;
  font-size: 42px;
  margin-bottom: 60px;
  color: #1A1A1A;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 32px;
}

.feature-card {
  background: white;
  padding: 40px 32px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #E2E8F0;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(46, 125, 50, 0.15);
  border-color: #2E7D32;
}

.feature-icon {
  font-size: 56px;
  margin-bottom: 20px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.feature-card h3 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #1A1A1A;
  font-weight: 600;
}

.feature-card p {
  color: #4A5568;
  line-height: 1.7;
  font-size: 15px;
}
</style>
