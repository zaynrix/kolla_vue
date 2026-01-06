<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home-view">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to Kolla</h1>
        <p class="hero-subtitle">Collaborative Task Management System</p>
        <p class="hero-description">
          Streamline your workflows, manage tasks efficiently, and collaborate seamlessly with your team
        </p>
      </div>
    </div>

    <!-- Dashboard Cards Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2 class="section-title">Quick Access</h2>
        <p class="section-subtitle">Navigate to your workspace</p>
      </div>
      
      <div class="dashboard-cards">
        <RouterLink to="/my-work-steps" class="dashboard-card">
          <div class="card-icon-wrapper">
            <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <h3 class="card-title">My Work Steps</h3>
          <p class="card-description">View and manage your assigned work steps and track your progress</p>
          <div class="card-footer">
            <span class="card-badge">User Dashboard</span>
            <svg class="card-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </RouterLink>

        <RouterLink to="/workflow-manager" class="dashboard-card">
          <div class="card-icon-wrapper">
            <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 class="card-title">Workflow Manager</h3>
          <p class="card-description">Track deadlines, manage workflows, and oversee project progress</p>
          <div class="card-footer">
            <span class="card-badge card-badge--manager">Manager Dashboard</span>
            <svg class="card-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="section-header">
        <h2 class="section-title">Key Features</h2>
        <p class="section-subtitle">Everything you need for efficient workflow management</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          </div>
          <h3 class="feature-title">Sequential Workflow Management</h3>
          <p class="feature-description">Organize tasks in logical sequences with automatic progression</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </div>
          <h3 class="feature-title">Automatic Assignment</h3>
          <p class="feature-description">Intelligent task assignment based on roles and availability</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 class="feature-title">Priority-Based Organization</h3>
          <p class="feature-description">Focus on what matters most with intelligent priority sorting</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h3 class="feature-title">Real-Time Tracking</h3>
          <p class="feature-description">Monitor progress and updates in real-time across all workflows</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h3 class="feature-title">Role-Based Access</h3>
          <p class="feature-description">Secure access control with granular permissions and roles</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="feature-title">Automated Notifications</h3>
          <p class="feature-description">Stay informed with automatic updates and deadline reminders</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
  margin: 0 auto;
  animation: fadeIn var(--transition-slow) ease-out;
  background: var(--color-background);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  padding: var(--spacing-3xl) var(--spacing-xl);
  text-align: center;
  color: white;
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
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--spacing-md) 0;
  letter-spacing: -0.02em;
  line-height: var(--leading-tight);
}

@media (min-width: 768px) {
  .hero-title {
    font-size: var(--text-5xl);
  }
}

@media (min-width: 1440px) {
  .hero-title {
    font-size: 4rem;
  }
}

.hero-subtitle {
  font-size: var(--text-xl);
  margin: 0 0 var(--spacing-md) 0;
  opacity: 0.95;
  font-weight: var(--font-medium);
}

.hero-description {
  font-size: var(--text-lg);
  margin: 0;
  opacity: 0.9;
  line-height: var(--leading-relaxed);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 768px) {
  .hero-section {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }

  .hero-title {
    font-size: var(--text-3xl);
  }

  .hero-subtitle {
    font-size: var(--text-lg);
  }

  .hero-description {
    font-size: var(--text-base);
  }
}

/* Dashboard Section */
.dashboard-section {
  padding: var(--spacing-3xl) var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

@media (min-width: 1440px) {
  .dashboard-section {
    max-width: 1600px;
    padding: var(--spacing-3xl) var(--spacing-3xl);
  }
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

@media (min-width: 768px) {
  .dashboard-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-2xl);
  }
}

.dashboard-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-base);
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-primary);
}

.dashboard-card:hover::before {
  transform: scaleX(1);
}

.card-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
  transition: transform var(--transition-base);
}

.dashboard-card:hover .card-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.card-icon {
  width: 32px;
  height: 32px;
  color: white;
}

.card-title {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
}

.card-description {
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xl) 0;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  flex: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.card-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-badge--manager {
  background: var(--color-secondary-light);
  color: var(--color-secondary);
}

.card-arrow {
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
  transition: transform var(--transition-base);
}

.dashboard-card:hover .card-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

/* Features Section */
.features-section {
  padding: var(--spacing-3xl) var(--spacing-xl);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  max-width: 1400px;
  margin: 0 auto;
}

@media (min-width: 1440px) {
  .features-section {
    max-width: 1600px;
    padding: var(--spacing-3xl) var(--spacing-3xl);
  }
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

@media (min-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xl);
  }
}

@media (min-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature-item {
  padding: var(--spacing-xl);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.feature-icon svg {
  width: 24px;
  height: 24px;
}

.feature-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  letter-spacing: -0.01em;
}

.feature-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

@media (max-width: 768px) {
  .dashboard-section,
  .features-section {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }

  .section-title {
    font-size: var(--text-2xl);
  }

  .card-title {
    font-size: var(--text-xl);
  }
}
</style>
