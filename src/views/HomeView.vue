<template>
  <div class="home-view">
    <div class="hero-section">
      <h1>Welcome to LocalLoop</h1>
      <p class="subtitle">MIT's Community Resource Sharing Platform</p>
      <div class="cta-buttons">
        <router-link to="/items" class="btn btn-primary">Browse Items</router-link>
        <router-link to="/items/new" class="btn btn-secondary">List an Item</router-link>
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
// Home view doesn't need any logic for now
</script>

<style scoped>
.home-view {
  min-height: calc(100vh - 60px);
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
}

.hero-section h1 {
  font-size: 48px;
  margin-bottom: 16px;
  font-weight: 700;
}

.subtitle {
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background-color: white;
  color: #667eea;
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.features-section {
  padding: 80px 20px;
  background-color: #f9f9f9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-section h2 {
  text-align: center;
  font-size: 36px;
  margin-bottom: 50px;
  color: #2c3e50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #2c3e50;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}
</style>
