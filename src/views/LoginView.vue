<!--
  LoginView - Login screen for user authentication
  Users log in with their display name (given by admin)
-->
<template>
  <div class="login-view">
    <div class="login-container">
      <!-- Left Side - Branding Section -->
      <div class="login-branding">
        <div class="branding-content">
          <div class="logo-wrapper">
            <img src="@/assets/logo.svg" alt="TH Brandenburg Logo" class="login-logo" />
          </div>
          <h1 class="branding-title">Kolla</h1>
          <p class="branding-subtitle">System Management Platform</p>
          <div class="branding-divider"></div>
          <p class="branding-description">
            Streamline your workflow management with our professional enterprise solution
          </p>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="login-card">
        <div class="login-header">
          <h2 class="login-title">Welcome Back</h2>
          <p class="login-subtitle">Sign in to access your account</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="name" class="form-label">
              <svg class="form-label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Your Name
            </label>
            <div class="input-wrapper">
              <input
                id="name"
                v-model="name"
                type="text"
                class="form-input"
                placeholder="Enter your display name"
                required
                autofocus
                :disabled="loading"
              />
            </div>
          </div>

          <button
            type="submit"
            class="btn btn--primary btn--block"
            :disabled="loading || !name.trim()"
          >
            <span v-if="loading" class="btn-content">
              <svg class="btn-spinner" fill="none" viewBox="0 0 24 24">
                <circle class="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
                <path class="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing in...</span>
            </span>
            <span v-else class="btn-content">
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              <span>Sign In</span>
            </span>
          </button>

          <div v-if="error" class="error-message">
            <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ error }}</span>
          </div>
        </form>

        <!-- Debug Section -->
        <div class="debug-section">
          <button
            @click="showDebug = !showDebug"
            class="debug-toggle-btn"
            type="button"
          >
            <svg class="debug-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ showDebug ? 'Hide' : 'Show' }} Available Users</span>
            <svg class="debug-arrow" :class="{ 'rotated': showDebug }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <transition name="slide-down">
            <div v-if="showDebug" class="debug-content">
              <div class="debug-header">
                <h3 class="debug-title">Available Users</h3>
                <p class="debug-subtitle">Click on a user to auto-fill the login field</p>
              </div>
              <div v-if="loadingActors" class="debug-loading">
                <svg class="loading-spinner" fill="none" viewBox="0 0 24 24">
                  <circle class="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
                  <path class="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading users...</span>
              </div>
              <div v-else-if="actors.length === 0" class="debug-empty">
                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>No users found. Admin needs to create users first.</p>
              </div>
              <div v-else class="debug-users">
                <div
                  v-for="actor in actors"
                  :key="actor.guid"
                  class="debug-user-item"
                  @click="name = actor.displayName"
                >
                  <div class="debug-user-avatar">
                    {{ actor.displayName.charAt(0).toUpperCase() }}
                  </div>
                  <div class="debug-user-info">
                    <div class="debug-user-name">{{ actor.displayName }}</div>
                    <div class="debug-user-role">
                      <span v-if="actor.role" class="badge badge--role">
                        {{ actor.role.displayName }}
                        <span v-if="actor.role.isAdmin" class="badge-admin">Admin</span>
                      </span>
                      <span v-else class="badge badge--no-role">No role</span>
                    </div>
                  </div>
                  <svg class="debug-user-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActor } from '@/composables/useActor'
import { useUserStore } from '@/stores/user'
import { mapActorToUser } from '@/services/api/mappers'
import { Role } from '@/types/domain'
import type { ActorDto } from '@/types/api'

const router = useRouter()
const { actors, loadActors } = useActor()
const userStore = useUserStore()

const name = ref('')
const loading = ref(false)
const loadingActors = ref(false)
const error = ref<string | null>(null)
const showDebug = ref(false)

onMounted(async () => {
  // Load actors for debug section
  await loadActorsForDebug()
})

async function loadActorsForDebug() {
  loadingActors.value = true
  try {
    await loadActors()
  } catch (err) {
    console.error('Failed to load actors for debug:', err)
  } finally {
    loadingActors.value = false
  }
}

async function handleLogin() {
  if (!name.value.trim()) {
    error.value = 'Please enter your name'
    return
  }

  loading.value = true
  error.value = null

  try {
    // Find actor by display name (case-insensitive)
    const actor = actors.value.find(
      (a) => a.displayName.toLowerCase().trim() === name.value.toLowerCase().trim()
    )

    if (!actor) {
      error.value = `User "${name.value}" not found. Please check the debug section for available users.`
      loading.value = false
      return
    }

    // Map actor to user - admin status is determined by actor's role's isAdmin flag
    // The actor's role.isAdmin property determines if they are an admin
    const user = mapActorToUser(actor, actor.role)
    userStore.setCurrentUser(user)

    // Persist to localStorage
    localStorage.setItem('currentUser', JSON.stringify({
      actorGuid: actor.guid,
      displayName: actor.displayName,
    }))

    // Redirect based on role (admin status comes from actor.role.isAdmin)
    if (user.role === Role.ADMIN) {
      router.push('/')
    } else {
      router.push('/my-work-steps')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to login. Please try again.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 0;
  position: relative;
  overflow: hidden;
}

.login-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.login-container {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 100px rgba(0, 0, 0, 0.1);
}

@media (max-width: 968px) {
  .login-container {
    grid-template-columns: 1fr;
    min-height: auto;
  }
}

/* Branding Section */
.login-branding {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  position: relative;
  overflow: hidden;
}

.login-branding::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 968px) {
  .login-branding {
    padding: var(--spacing-2xl);
    min-height: 300px;
  }
}

.branding-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  max-width: 400px;
}

.logo-wrapper {
  margin-bottom: var(--spacing-xl);
  display: flex;
  justify-content: center;
}

.login-logo {
  height: 80px;
  width: auto;
  filter: brightness(0) invert(1);
  transition: transform var(--transition-base);
}

.branding-title {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--spacing-sm) 0;
  letter-spacing: -0.02em;
}

.branding-subtitle {
  font-size: var(--text-lg);
  margin: 0 0 var(--spacing-xl) 0;
  opacity: 0.9;
  font-weight: var(--font-medium);
}

.branding-divider {
  width: 60px;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 auto var(--spacing-xl);
  border-radius: var(--radius-full);
}

.branding-description {
  font-size: var(--text-base);
  line-height: 1.6;
  opacity: 0.85;
  margin: 0;
}

/* Login Card */
.login-card {
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--spacing-3xl);
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 968px) {
  .login-card {
    padding: var(--spacing-2xl);
    min-height: calc(100vh - 300px);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  margin-bottom: var(--spacing-2xl);
  text-align: left;
}

.login-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  letter-spacing: -0.02em;
}

.login-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: var(--font-normal);
}

.login-form {
  margin-bottom: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-xl);
  position: relative;
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  letter-spacing: 0.01em;
}

.form-label-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all var(--transition-base);
  box-sizing: border-box;
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family);
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input:disabled {
  background: var(--color-surface-hover);
  cursor: not-allowed;
  opacity: 0.6;
}

.btn {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.spinner-circle {
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite;
}

.spinner-path {
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

.btn--primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-error-light);
  color: var(--color-error);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  border: 1px solid rgba(239, 68, 68, 0.2);
  animation: shake 0.5s ease;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.debug-section {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.debug-toggle-btn {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.debug-toggle-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}

.debug-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
}

.debug-arrow {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
  transition: transform var(--transition-base);
}

.debug-arrow.rotated {
  transform: rotate(180deg);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.debug-content {
  margin-top: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.debug-header {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.debug-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.debug-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.debug-loading,
.debug-empty {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.loading-spinner,
.empty-icon {
  width: 40px;
  height: 40px;
  color: var(--color-text-tertiary);
}

.debug-users {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.debug-user-item {
  padding: var(--spacing-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.debug-user-item:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.debug-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  font-size: var(--text-base);
  flex-shrink: 0;
}

.debug-user-info {
  flex: 1;
  min-width: 0;
}

.debug-user-name {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  font-size: var(--text-base);
}

.debug-user-role {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.debug-user-arrow {
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  transition: transform var(--transition-base);
}

.debug-user-item:hover .debug-user-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

.badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.badge--role {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.badge--no-role {
  background: var(--color-surface-hover);
  color: var(--color-text-tertiary);
}

.badge-admin {
  color: var(--color-error);
  font-weight: var(--font-bold);
}

@media (max-width: 768px) {
  .login-card {
    padding: var(--spacing-xl);
  }

  .login-title {
    font-size: var(--text-2xl);
  }

  .branding-title {
    font-size: var(--text-3xl);
  }

  .login-logo {
    height: 60px;
  }
}
</style>

