<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home-view">
    <div class="home-content">
      <h1>Welcome to Kolla</h1>
      <p class="subtitle">Kollaboratives Aufgabenmanagementsystem</p>

      <div class="dashboard-cards">
        <RouterLink to="/actor" class="dashboard-card">
          <h2>My Work Steps</h2>
          <p>View and manage your assigned work steps</p>
          <div class="card-badge">Actor View</div>
        </RouterLink>

        <RouterLink to="/workflow-manager" class="dashboard-card">
          <h2>Workflow Manager</h2>
          <p>Track deadlines and manage workflows</p>
          <div class="card-badge">Manager View</div>
        </RouterLink>
      </div>

      <div class="features">
        <h2>Features</h2>
        <ul>
          <li>✅ Sequential workflow management</li>
          <li>✅ Automatic work step assignment</li>
          <li>✅ Priority-based task organization</li>
          <li>✅ Real-time progress tracking</li>
          <li>✅ Role-based access control</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  padding: var(--spacing-xl);
  width: 100%;
  margin: 0 auto;
  animation: fadeIn var(--transition-slow) ease-out;
}

@media (min-width: 768px) {
  .home-view {
    padding: var(--spacing-2xl) var(--spacing-3xl);
  }
}

@media (min-width: 1440px) {
  .home-view {
    padding: var(--spacing-3xl) var(--spacing-3xl);
    max-width: 1800px;
  }
}

.home-content {
  text-align: center;
}

.home-content h1 {
  font-size: var(--text-3xl);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
  font-weight: var(--font-bold);
  letter-spacing: -0.03em;
  line-height: var(--leading-tight);
}

@media (min-width: 768px) {
  .home-content h1 {
    font-size: var(--text-4xl);
  }
}

@media (min-width: 1440px) {
  .home-content h1 {
    font-size: 3.5rem;
  }
}

.subtitle {
  font-size: var(--text-xl);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-3xl);
  font-weight: var(--font-normal);
}

.dashboard-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 768px) {
  .dashboard-cards {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }
}

@media (min-width: 1440px) {
  .dashboard-cards {
    grid-template-columns: repeat(2, 1fr);
    max-width: 1600px;
  }
}

.dashboard-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid var(--color-border-light);
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
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-base);
}

.dashboard-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-primary-light);
}

.dashboard-card:hover::before {
  transform: scaleX(1);
}

.dashboard-card h2 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-primary);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.02em;
}

.dashboard-card p {
  color: var(--color-text-secondary);
  margin: var(--spacing-sm) 0;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.card-badge {
  margin-top: auto;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: var(--color-text-inverse);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.dashboard-card:hover .card-badge {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.features {
  text-align: left;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  max-width: 1400px;
  margin: 0 auto;
  border: 1px solid var(--color-border-light);
}

@media (min-width: 1440px) {
  .features {
    max-width: 1600px;
    padding: var(--spacing-3xl);
  }
}

.features h2 {
  margin-top: 0;
  margin-bottom: var(--spacing-xl);
  color: var(--color-text-primary);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.02em;
}

.features ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .features ul {
    grid-template-columns: repeat(2, 1fr);
  }
}

.features li {
  padding: var(--spacing-md);
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--color-background);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  border: 1px solid var(--color-border-light);
}

.features li:hover {
  background: var(--color-surface-hover);
  transform: translateX(4px);
  border-color: var(--color-primary-light);
}
</style>
