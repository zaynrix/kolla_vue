<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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

// Lock body scroll when drawer is open (mobile)
watch(showMobileMenu, (isOpen) => {
  if (isOpen) {
    // Prevent body scroll when drawer is open
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
  } else {
    // Restore body scroll when drawer is closed
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
})
</script>

<template>
  <div id="app" :class="{ 'drawer-open': showMobileMenu }">
    <header v-if="isAuthenticated && !isLoginPage" class="app-header">
      <div class="header-container">
        <!-- Left Section: Logo + Mobile Menu Toggle -->
        <div class="header-left">
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
          
          <RouterLink to="/" class="brand-link" @click="closeMobileMenu">
            <img :src="logo" alt="TH Brandenburg Logo" class="brand-logo" />
            <h1 class="app-title">Kolla</h1>
          </RouterLink>
        </div>

        <!-- Center Section: Desktop Navigation -->
        <nav class="main-nav desktop-nav">
          <RouterLink to="/" class="nav-link" @click="closeMobileMenu">
            <span class="nav-text">Home</span>
          </RouterLink>
          <RouterLink to="/my-work-steps" class="nav-link" @click="closeMobileMenu">
            <span class="nav-text">My Work Steps</span>
          </RouterLink>
          <RouterLink v-if="isAdmin || userStore.isWorkflowManager" to="/workflow-manager" class="nav-link" @click="closeMobileMenu">
            <span class="nav-text">Workflow Manager</span>
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/roles" class="nav-link" @click="closeMobileMenu">
            <span class="nav-text">Roles</span>
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/users" class="nav-link" @click="closeMobileMenu">
            <span class="nav-text">Users</span>
          </RouterLink>
        </nav>

        <!-- Right Section: User Actions (Hidden on mobile - available in drawer) -->
        <div class="header-right">
          <ThemeToggle />
          
          <div class="notification-container">
            <button @click="showNotifications = !showNotifications" class="icon-button notification-button" aria-label="Notifications" title="Notifications">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <NotificationBadge v-if="unreadCount > 0" :count="unreadCount" />
              <span class="notification-label">Notifications</span>
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
            <button @click="handleLogout" class="icon-button btn-logout" aria-label="Logout" title="Logout">
              <svg class="icon logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span class="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Drawer - Must be outside app-main to be above all content -->
      <Teleport to="body">
      <transition name="drawer">
          <div 
            v-if="showMobileMenu" 
            class="drawer-overlay" 
            @click="closeMobileMenu"
            @touchstart.prevent="closeMobileMenu"
          ></div>
      </transition>
      
      <transition name="drawer-slide">
          <aside 
            v-if="showMobileMenu" 
            class="drawer"
            @click.stop
          >
          <div class="drawer-header">
            <div class="drawer-brand">
              <img :src="logo" alt="TH Brandenburg Logo" class="drawer-logo" />
              <h2 class="drawer-title">Kolla</h2>
            </div>
            <button @click="closeMobileMenu" class="drawer-close" aria-label="Close menu">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <nav class="drawer-nav">
            <RouterLink to="/" class="drawer-nav-link" @click="closeMobileMenu">
              <svg class="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span>Home</span>
            </RouterLink>
            <RouterLink to="/my-work-steps" class="drawer-nav-link" @click="closeMobileMenu">
              <svg class="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <span>My Work Steps</span>
            </RouterLink>
            <RouterLink v-if="isAdmin || userStore.isWorkflowManager" to="/workflow-manager" class="drawer-nav-link" @click="closeMobileMenu">
              <svg class="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span>Workflow Manager</span>
            </RouterLink>
            <RouterLink v-if="isAdmin" to="/roles" class="drawer-nav-link" @click="closeMobileMenu">
              <svg class="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span>Roles</span>
            </RouterLink>
            <RouterLink v-if="isAdmin" to="/users" class="drawer-nav-link" @click="closeMobileMenu">
              <svg class="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <span>Users</span>
            </RouterLink>
          </nav>
          
          <div class="drawer-footer">
            <div class="drawer-user-info">
              <div class="user-avatar drawer-avatar">
                <span class="avatar-text">{{ currentUser?.username?.charAt(0).toUpperCase() || 'U' }}</span>
              </div>
              <div class="drawer-user-details">
                <span class="user-name">{{ currentUser?.username }}</span>
                <span v-if="isAdmin" class="user-badge">Admin</span>
              </div>
            </div>
            
            <div class="drawer-actions">
              <div class="drawer-theme-controls">
                <ThemeToggle />
              </div>
              
              <button @click="showNotifications = !showNotifications" class="drawer-action-button">
                <svg class="drawer-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <span>Notifications</span>
                <NotificationBadge v-if="unreadCount > 0" :count="unreadCount" />
              </button>
              <NotificationPanel v-if="showNotifications" class="drawer-notification-dropdown" />
              
              <button @click="handleLogout" class="drawer-action-button drawer-action-button--logout">
                <svg class="drawer-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>
      </transition>
      </Teleport>
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
  position: relative;
}

/* When drawer is open, ensure content stays in place */
#app.drawer-open {
  overflow: hidden;
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
  padding: var(--spacing-sm) var(--spacing-lg);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--spacing-md);
  position: relative;
  min-height: 64px;
}

/* Mobile: Stack layout */
@media (max-width: 767px) {
  .header-container {
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-sm);
    min-height: 56px;
    grid-template-columns: auto 1fr auto;
  }
}

/* Tablet: More spacing */
@media (min-width: 768px) and (max-width: 1023px) {
  .header-container {
    padding: var(--spacing-md) var(--spacing-lg);
    gap: var(--spacing-lg);
  }
}

/* Desktop: Full spacing */
@media (min-width: 1024px) {
  .header-container {
    padding: var(--spacing-md) var(--spacing-xl);
    gap: var(--spacing-xl);
  }
}

/* Header Sections */
.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

/* Hide header-right on mobile - these features are available in the drawer */
@media (max-width: 767px) {
  .header-right {
    display: none;
  }
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
  gap: var(--spacing-xs);
  text-decoration: none;
  color: inherit;
  transition: transform var(--transition-base);
  flex-shrink: 1;
  min-width: 0;
}

@media (max-width: 767px) {
  .brand-link {
    gap: var(--spacing-xs);
    max-width: calc(100vw - 80px); /* Leave space for menu toggle only (header-right is hidden) */
  }
}

.brand-link:hover {
  transform: scale(1.02);
}

.brand-logo {
  height: 32px;
  width: auto;
  flex-shrink: 0;
  display: block;
  filter: brightness(0) invert(1);
  transition: transform var(--transition-base);
}

.brand-link:hover .brand-logo {
  transform: scale(1.05);
}

@media (min-width: 480px) {
  .brand-logo {
    height: 36px;
  }
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
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

@media (min-width: 480px) {
  .app-title {
    font-size: var(--text-lg);
    max-width: 250px;
  }
}

@media (min-width: 768px) {
  .app-title {
    font-size: var(--text-xl);
    max-width: none;
  }
}

@media (min-width: 1024px) {
  .app-title {
    font-size: var(--text-2xl);
  }
}

/* Desktop Navigation */
.desktop-nav {
  display: none;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }
}

@media (min-width: 1024px) {
  .desktop-nav {
    gap: var(--spacing-sm);
  }
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
  min-width: fit-content;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .nav-link {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--text-xs);
  }
}

.nav-text {
  display: none;
}

/* Show nav text on tablet and desktop */
@media (min-width: 768px) {
  .nav-text {
    display: inline;
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

/* Common Icon Button Style */
.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-inverse);
  cursor: pointer;
  transition: all var(--transition-base);
  min-width: 40px;
  min-height: 40px;
  position: relative;
  touch-action: manipulation;
}

.icon-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.icon-button .icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: block;
}

@media (min-width: 768px) {
  .icon-button {
    min-width: 44px;
    min-height: 44px;
  }
  
  .icon-button .icon {
    width: 22px;
    height: 22px;
  }
}

.notification-container {
  position: relative;
}

.notification-button {
  position: relative;
}

.notification-button:hover .icon {
  transform: scale(1.1);
  animation: ring 0.5s ease-in-out;
}

.notification-label {
  display: none;
  font-size: var(--text-sm);
  color: var(--color-text-inverse);
  font-weight: var(--font-medium);
  margin-left: var(--spacing-xs);
}

/* Show notification label only on desktop */
@media (min-width: 1024px) {
  .notification-button {
    padding: var(--spacing-sm) var(--spacing-md);
    min-width: auto;
  }
  
  .notification-label {
    display: inline;
  }
}

@keyframes ring {
  0%, 100% {
    transform: rotate(0deg) scale(1.1);
  }
  25% {
    transform: rotate(-10deg) scale(1.1);
  }
  75% {
    transform: rotate(10deg) scale(1.1);
  }
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  z-index: 1001;
  min-width: 320px;
  max-width: calc(100vw - var(--spacing-lg) * 2);
}

@media (max-width: 767px) {
  .notification-dropdown {
    min-width: 280px;
    max-width: calc(100vw - var(--spacing-md) * 2);
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .notification-dropdown {
    min-width: 300px;
  }
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
}

@media (min-width: 768px) {
  .user-menu {
    padding: var(--spacing-xs) var(--spacing-sm);
    gap: var(--spacing-sm);
  }
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  font-size: var(--text-xs);
  color: var(--color-text-inverse);
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: var(--text-sm);
  }
}

.user-details {
  display: none;
  flex-direction: column;
  gap: 2px;
}

@media (min-width: 768px) {
  .user-details {
    display: flex;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .user-details {
    display: none; /* Hide on tablet to save space */
  }
}

@media (min-width: 1024px) {
  .user-details {
    display: flex;
  }
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
  margin-left: 0;
}

.logout-text {
  display: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-left: var(--spacing-xs);
}

/* Show logout text only on desktop */
@media (min-width: 1024px) {
  .btn-logout {
    padding: var(--spacing-sm) var(--spacing-md);
    min-width: auto;
  }
  
  .logout-text {
    display: inline;
  }
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
  min-width: 40px;
  min-height: 40px;
  flex-shrink: 0;
  touch-action: manipulation;
}

@media (min-width: 768px) {
  .mobile-menu-toggle {
    display: none;
  }
}

@media (min-width: 480px) {
  .mobile-menu-toggle {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
  }
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

/* Drawer Overlay */
.drawer-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999 !important; /* Above header and all other elements */
  touch-action: none; /* Prevent scrolling on overlay */
  -webkit-tap-highlight-color: transparent; /* Remove tap highlight on mobile */
  pointer-events: auto; /* Ensure overlay captures clicks */
}

/* Drawer Sidebar */
.drawer {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  bottom: 0 !important;
  width: 280px;
  max-width: 85vw;
  background: var(--header-gradient);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  color: var(--color-text-inverse);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
  z-index: 10000 !important; /* Above overlay and all other elements */
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y; /* Allow vertical scrolling only */
  -webkit-tap-highlight-color: transparent; /* Remove tap highlight on mobile */
  transform: translateX(0); /* Ensure drawer is positioned correctly */
  pointer-events: auto; /* Ensure drawer captures clicks */
  isolation: isolate; /* Create new stacking context */
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.drawer-logo {
  height: 32px;
  width: auto;
  filter: brightness(0) invert(1);
}

.drawer-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-inverse);
  cursor: pointer;
  transition: all var(--transition-base);
  touch-action: manipulation; /* Improve touch response */
  -webkit-tap-highlight-color: transparent;
}

.drawer-close svg {
  width: 20px;
  height: 20px;
}

.drawer-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  flex: 1;
  overflow-y: auto;
}

.drawer-nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  color: var(--color-text-inverse);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  background: rgba(255, 255, 255, 0.05);
  touch-action: manipulation; /* Improve touch response */
  -webkit-tap-highlight-color: transparent;
  user-select: none; /* Prevent text selection on tap */
}

.drawer-nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.drawer-nav-link.router-link-exact-active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: var(--font-semibold);
  border-left: 3px solid var(--color-text-inverse);
}

.drawer-nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.drawer-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--spacing-lg);
  flex-shrink: 0;
}

.drawer-user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
}

.drawer-avatar {
  width: 48px;
  height: 48px;
  font-size: var(--text-lg);
}

.drawer-user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.drawer-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.drawer-theme-controls {
  display: flex;
  justify-content: center;
  padding: var(--spacing-sm) 0;
  margin-bottom: var(--spacing-sm);
}

.drawer-action-button {
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

.drawer-action-button--logout {
  background: rgba(220, 38, 38, 0.2);
  border-color: rgba(220, 38, 38, 0.3);
}

.drawer-action-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.drawer-action-button--logout:hover {
  background: rgba(220, 38, 38, 0.3);
}

.drawer-action-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.drawer-notification-dropdown {
  position: relative;
  margin-top: var(--spacing-sm);
  z-index: 1001;
  width: 100%;
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

/* Drawer Animations */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from {
  transform: translateX(-100%);
}

.drawer-slide-leave-to {
  transform: translateX(-100%);
}

/* Prevent drawer from being dragged outside viewport */
.drawer {
  will-change: transform; /* Optimize animation performance */
}

/* Ensure drawer overlay captures all touch events */
.drawer-overlay {
  will-change: opacity;
}

/* Tablet Styles (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .app-title {
    font-size: var(--text-xl);
  }

  .nav-link {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--text-xs);
  }
}

/* Desktop Styles (1024px+) */
@media (min-width: 1024px) {
  .nav-link {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--text-sm);
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .header-container {
    padding: var(--spacing-lg) var(--spacing-2xl);
  }

  .desktop-nav {
    gap: var(--spacing-md);
  }

  .nav-link {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--text-base);
  }
}

/* Extra Large Desktop (1920px+) */
@media (min-width: 1920px) {
  .header-container {
    padding: var(--spacing-lg) var(--spacing-3xl);
  }
}

/* App Main */
.app-main {
  flex: 1;
  background: var(--color-background);
  min-height: calc(100vh - 60px);
}

@media (min-width: 768px) {
  .app-main {
    min-height: calc(100vh - 70px);
  }
}

@media (min-width: 1024px) {
  .app-main {
    min-height: calc(100vh - 80px);
  }
}

/* Drawer responsive adjustments */
@media (min-width: 768px) {
  .drawer-overlay,
  .drawer {
    display: none !important; /* Force hide on desktop */
  }
}

/* Ensure drawer is always on top on mobile */
@media (max-width: 767px) {
  .drawer-overlay {
    z-index: 9999 !important;
  }
  
  .drawer {
    z-index: 10000 !important;
  }
  
  /* Ensure header doesn't overlap drawer */
  .app-header {
    z-index: 1000; /* Lower than drawer */
  }
  
  /* Ensure main content is below drawer */
  .app-main {
    position: relative;
    z-index: 1; /* Below drawer */
  }
  
  /* Ensure all view content is below drawer */
  .app-main {
    z-index: 1 !important;
  }
  
  .app-main > * {
    position: relative;
    z-index: 1 !important;
  }
  
  /* Ensure RouterView and all its children are below drawer */
  .app-main :deep(*) {
    position: relative;
    z-index: 1 !important;
  }
  
  /* Override any high z-index in views - use more specific selectors */
  .app-main :deep(.hero-section),
  .app-main :deep(.hero-content),
  .app-main :deep(.dashboard-section),
  .app-main :deep(.dashboard-card),
  .app-main :deep(.features-section),
  .app-main :deep(.home-view),
  .app-main :deep([class*="hero"]),
  .app-main :deep([class*="dashboard"]),
  .app-main :deep([class*="card"]),
  .app-main :deep([class*="section"]),
  .app-main :deep([class*="view"]) {
    z-index: 1 !important;
    position: relative !important;
  }
}

@media (max-width: 767px) {
  .drawer-nav-link {
    min-height: 48px; /* Touch-friendly target */
  }

  .drawer-action-button {
    min-height: 48px; /* Touch-friendly target */
  }
}
</style>
