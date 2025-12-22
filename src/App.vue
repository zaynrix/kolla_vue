<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import NotificationBadge from '@/components/presenters/NotificationBadge.vue'
import NotificationPanel from '@/components/containers/NotificationPanel.vue'

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const showNotifications = ref(false)

const unreadCount = computed(() => {
  if (!userStore.currentUser) return 0
  return notificationStore.unreadNotifications.filter(
    (n) => n.userId === userStore.currentUser?.id
  ).length
})
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">Kolla - Aufgabenmanagementsystem</h1>
        <div class="header-right">
          <nav class="main-nav">
            <RouterLink to="/" class="nav-link">Home</RouterLink>
            <RouterLink to="/actor" class="nav-link">My Work Steps</RouterLink>
            <RouterLink to="/workflow-manager" class="nav-link">Workflow Manager</RouterLink>
            <RouterLink to="/roles" class="nav-link">Roles</RouterLink>
            <RouterLink to="/actors" class="nav-link">Actors</RouterLink>
          </nav>
          <div class="notification-container">
            <button @click="showNotifications = !showNotifications" class="notification-button">
              🔔
              <NotificationBadge v-if="unreadCount > 0" :count="unreadCount" />
            </button>
            <NotificationPanel v-if="showNotifications" class="notification-dropdown" />
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-text-inverse);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  backdrop-filter: blur(10px);
}

@media (min-width: 768px) {
  .app-header {
    padding: var(--spacing-lg) var(--spacing-xl);
  }
}

.header-content {
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
  padding: 0 1rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.notification-container {
  position: relative;
}

.notification-button {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  font-size: var(--text-xl);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.notification-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-md));
  right: 0;
  z-index: var(--z-dropdown);
}

@media (min-width: 768px) {
  .header-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0;
    padding: 0 3rem;
  }
}

@media (min-width: 1440px) {
  .header-content {
    padding: 0 4rem;
    max-width: 1800px;
  }
}

.app-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (min-width: 768px) {
  .app-title {
    font-size: var(--text-2xl);
  }
}

.main-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

@media (min-width: 768px) {
  .main-nav {
    flex-direction: row;
    gap: 1rem;
    width: auto;
  }
}

.nav-link {
  color: var(--color-text-inverse);
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  text-align: center;
  display: block;
  font-weight: var(--font-medium);
  position: relative;
  opacity: 0.9;
}

@media (min-width: 768px) {
  .nav-link {
    text-align: left;
    display: inline-block;
  }
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  opacity: 1;
  transform: translateY(-1px);
}

.nav-link.router-link-exact-active {
  background: rgba(255, 255, 255, 0.25);
  font-weight: var(--font-semibold);
  opacity: 1;
  box-shadow: var(--shadow-sm);
}

.nav-link.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: var(--color-text-inverse);
  border-radius: var(--radius-full);
}

@media (min-width: 768px) {
  .nav-link.router-link-exact-active::after {
    left: var(--spacing-md);
    transform: translateX(0);
    width: calc(100% - 2rem);
  }
}

.app-main {
  flex: 1;
  background: var(--color-background);
  min-height: calc(100vh - 80px);
}
</style>
