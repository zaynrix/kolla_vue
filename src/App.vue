<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNotification } from '@/composables/useNotification'
import { useTheme } from '@/composables/useTheme'
import NotificationBadge from '@/components/presenters/NotificationBadge.vue'
import NotificationPanel from '@/components/containers/NotificationPanel.vue'
import ThemeToggle from '@/components/presenters/ThemeToggle.vue'
import LogoutDialog from '@/components/presenters/LogoutDialog.vue'
import logo from '@/assets/logo.svg'

// ViewModel: Exposes reactive state and commands
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { unreadCount } = useNotification()
const { loadTheme } = useTheme()
const showNotifications = ref(false)
const showLogoutDialog = ref(false)

// Initialize theme on mount
onMounted(() => {
  loadTheme()
})

const isAuthenticated = computed(() => userStore.isAuthenticated)
const isAdmin = computed(() => userStore.isAdmin)
const currentUser = computed(() => userStore.currentUser)
const isLoginPage = computed(() => route.path === '/login')
const showMobileMenu = ref(false)

function handleLogout() {
  // Show custom logout dialog
  showLogoutDialog.value = true
}

function confirmLogout() {
  // Clear user state first
  userStore.logout()
  // Close mobile menu if open
  showMobileMenu.value = false
  // Close logout dialog
  showLogoutDialog.value = false
  // Navigate to login - the router guard will allow it since user is no longer authenticated
  router.replace('/login').catch((err) => {
    // Ignore navigation errors (e.g., if already on login page)
    console.warn('Navigation error during logout:', err)
  })
}

function cancelLogout() {
  showLogoutDialog.value = false
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function closeMobileMenu() {
  showMobileMenu.value = false
}

// Close mobile menu when route changes
watch(() => route.path, () => {
  showMobileMenu.value = false
})
</script>

<template>
  <div id="app">
    <header v-if="isAuthenticated && !isLoginPage" class="app-header">
      <div class="header-container">
        <!-- Logo and Title -->
        <div class="header-brand">
          <RouterLink to="/" class="brand-link" @click="closeMobileMenu">
            <img :src="logo" alt="TH Brandenburg Logo" class="brand-logo" />
            <h1 class="app-title">Kolla - System Management</h1>
          </RouterLink>
        </div>

        <!-- Desktop Navigation -->
        <nav class="main-nav desktop-nav">
          <RouterLink to="/" class="nav-link" @click="closeMobileMenu">
            <span class="nav-text">Home</span>
          </RouterLink>
          <RouterLink to="/my-work-steps" class="nav-link" @click="closeMobileMenu">
            <span class="nav-text">My Work Steps</span>
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/workflow-manager" class="nav-link" @click="closeMobileMenu">
            <span class="nav-text">Workflow Manager</span>
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/roles" class="nav-link" @click="closeMobileMenu">
            <span class="nav-text">Roles</span>
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/users" class="nav-link" @click="closeMobileMenu">
            <span class="nav-text">Users</span>
          </RouterLink>
        </nav>

        <!-- User Actions (Desktop) -->
        <div class="header-actions desktop-actions">
          <ThemeToggle />
          
          <div class="notification-container">
            <button @click="showNotifications = !showNotifications" class="notification-button" aria-label="Notifications">
              <span class="notification-icon"></span>
              <NotificationBadge v-if="unreadCount > 0" :count="unreadCount" />
            </button>
            <NotificationPanel v-if="showNotifications" class="notification-dropdown" />
          </div>
          
          <div class="user-menu">
            <div class="user-avatar">
              <span class="avatar-text">{{ currentUser?.username?.charAt(0).toUpperCase() || 'U' }}</span>
            </div>
            <div class="user-details">
              <span class="user-name">{{ currentUser?.username }}</span>
              <span v-if="isAdmin" class="user-badge">Admin</span>
            </div>
            <button @click="handleLogout" class="btn-logout" aria-label="Logout">
              <span class="logout-text">Logout</span>
            </button>
          </div>
        </div>

        <!-- Mobile Menu Toggle -->
        <button 
          @click="toggleMobileMenu" 
          class="mobile-menu-toggle"
          :aria-expanded="showMobileMenu"
          aria-label="Toggle menu"
        >
          <span class="hamburger-icon" :class="{ 'active': showMobileMenu }">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      <!-- Mobile Navigation Menu -->
      <transition name="slide-down">
        <div v-if="showMobileMenu" class="mobile-menu">
          <nav class="mobile-nav">
            <RouterLink to="/" class="mobile-nav-link" @click="closeMobileMenu">
              <span>Home</span>
            </RouterLink>
            <RouterLink to="/my-work-steps" class="mobile-nav-link" @click="closeMobileMenu">
              <span>My Work Steps</span>
            </RouterLink>
            <RouterLink v-if="isAdmin" to="/workflow-manager" class="mobile-nav-link" @click="closeMobileMenu">
              <span>Workflow Manager</span>
            </RouterLink>
            <RouterLink v-if="isAdmin" to="/roles" class="mobile-nav-link" @click="closeMobileMenu">
              <span>Roles</span>
            </RouterLink>
            <RouterLink v-if="isAdmin" to="/users" class="mobile-nav-link" @click="closeMobileMenu">
              <span>Users</span>
            </RouterLink>
          </nav>
          
          <div class="mobile-user-section">
            <div class="mobile-theme-controls">
              <ThemeToggle />
            </div>
            
            <div class="mobile-user-info">
              <div class="user-avatar mobile">
                <span class="avatar-text">{{ currentUser?.username?.charAt(0).toUpperCase() || 'U' }}</span>
              </div>
              <div class="mobile-user-details">
                <span class="user-name">{{ currentUser?.username }}</span>
                <span v-if="isAdmin" class="user-badge">Admin</span>
              </div>
            </div>
            
            <div class="mobile-actions">
              <button @click="showNotifications = !showNotifications" class="mobile-notification-button">
                <span>Notifications</span>
                <NotificationBadge v-if="unreadCount > 0" :count="unreadCount" />
              </button>
              <NotificationPanel v-if="showNotifications" class="mobile-notification-dropdown" />
              
              <button @click="handleLogout" class="mobile-logout-button">
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <!-- Logout Confirmation Dialog -->
    <LogoutDialog 
      :show="showLogoutDialog"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header Base Styles */
.app-header {
  background: var(--header-gradient);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  color: var(--color-text-inverse);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-container {
  max-width: 1800px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  position: relative;
}

/* Brand/Logo Section */
.header-brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: inherit;
  transition: transform var(--transition-base);
}

.brand-link:hover {
  transform: scale(1.02);
}

.brand-logo {
  height: 40px;
  width: auto;
  flex-shrink: 0;
  display: block;
  filter: brightness(0) invert(1);
  transition: transform var(--transition-base);
}

.brand-link:hover .brand-logo {
  transform: scale(1.05);
}

@media (min-width: 768px) {
  .brand-logo {
    height: 45px;
  }
}

@media (min-width: 1024px) {
  .brand-logo {
    height: 50px;
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
  white-space: nowrap;
}

/* Desktop Navigation */
.desktop-nav {
  display: none;
  flex: 1;
  justify-content: center;
  gap: var(--spacing-xs);
  margin: 0 var(--spacing-xl);
}

.nav-link {
  display: flex;
  align-items: center;
  color: var(--color-text-inverse);
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  position: relative;
  opacity: 0.9;
  white-space: nowrap;
}

.nav-text {
  display: none;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

/* Desktop User Actions */
.desktop-actions {
  display: none;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
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
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.notification-icon {
  width: 20px;
  height: 20px;
  position: relative;
  display: block;
}

.notification-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-text-inverse);
  border-radius: 50% 50% 50% 0;
  transform: translateX(-50%) rotate(-45deg);
}

.notification-icon::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: var(--color-text-inverse);
  border-radius: 50%;
}

.notification-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  z-index: 1001;
  min-width: 320px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  color: var(--color-text-inverse);
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: var(--font-semibold);
  color: var(--color-text-inverse);
  font-size: var(--text-sm);
  line-height: 1.2;
}

.user-badge {
  padding: 2px var(--spacing-xs);
  background: var(--color-danger);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-text-inverse);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-base);
  margin-left: var(--spacing-xs);
}

.logout-text {
  display: none;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.mobile-menu-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 20px;
  height: 16px;
  position: relative;
}

.hamburger-icon span {
  display: block;
  width: 100%;
  height: 2px;
  background: var(--color-text-inverse);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-icon.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger-icon.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-icon.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile Menu */
.mobile-menu {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--spacing-lg);
  animation: slideDown 0.3s ease;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  color: var(--color-text-inverse);
  text-decoration: none;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  font-weight: var(--font-medium);
  background: rgba(255, 255, 255, 0.05);
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-exact-active {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.mobile-nav-link.router-link-exact-active {
  font-weight: var(--font-semibold);
  border-left: 3px solid var(--color-text-inverse);
}

.mobile-theme-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.mobile-user-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: var(--spacing-lg);
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
}

.user-avatar.mobile {
  width: 48px;
  height: 48px;
  font-size: var(--text-lg);
}

.mobile-user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.mobile-notification-button,
.mobile-logout-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-text-inverse);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
}

.mobile-notification-button {
  justify-content: space-between;
}

.mobile-logout-button {
  justify-content: flex-start;
  background: rgba(220, 38, 38, 0.2);
  border-color: rgba(220, 38, 38, 0.3);
}

.mobile-notification-button:hover,
.mobile-logout-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.mobile-logout-button:hover {
  background: rgba(220, 38, 38, 0.3);
}

.mobile-notification-dropdown {
  position: relative;
  margin-top: var(--spacing-sm);
  z-index: 1001;
}

/* Animations */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Tablet Styles (768px - 1024px) */
@media (min-width: 768px) {
  .header-container {
    padding: var(--spacing-md) var(--spacing-xl);
  }

  .app-title {
    font-size: var(--text-2xl);
  }

  .desktop-nav {
    display: flex;
  }

  .desktop-actions {
    display: flex;
  }

  .mobile-menu-toggle {
    display: none;
  }

  .nav-text {
    display: inline;
  }

  .logout-text {
    display: inline;
  }

  .user-details {
    display: flex;
  }
}

/* Desktop Styles (1024px+) */
@media (min-width: 1024px) {
  .header-container {
    padding: var(--spacing-lg) var(--spacing-2xl);
  }

  .desktop-nav {
    gap: var(--spacing-sm);
  }

  .nav-link {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--text-base);
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .header-container {
    padding: var(--spacing-lg) var(--spacing-3xl);
  }
}

/* App Main */
.app-main {
  flex: 1;
  background: var(--color-background);
  min-height: calc(100vh - 70px);
}

@media (min-width: 768px) {
  .app-main {
    min-height: calc(100vh - 80px);
  }
}
</style>
