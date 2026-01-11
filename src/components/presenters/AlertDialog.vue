<template>
  <transition name="fade">
    <div v-if="show" class="alert-dialog-overlay" @click="handleClose">
      <div class="alert-dialog" @click.stop>
        <div class="dialog-header" :class="`dialog-header--${type}`">
          <div class="dialog-icon-wrapper">
            <svg v-if="type === 'error'" class="dialog-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <svg v-else-if="type === 'warning'" class="dialog-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <svg v-else-if="type === 'info'" class="dialog-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <svg v-else class="dialog-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="dialog-title">{{ title }}</h2>
        </div>
        
        <div class="dialog-content">
          <p class="dialog-message">
            {{ message }}
          </p>
        </div>
        
        <div class="dialog-actions">
          <button @click="handleClose" class="btn btn--primary">
            <span>OK</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  message: string
  type?: 'error' | 'warning' | 'info' | 'success'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Alert',
  type: 'info'
})

const emit = defineEmits<{
  close: []
}>()

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.alert-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.alert-dialog {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--color-border);
  max-width: 420px;
  width: 90%;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  color: var(--color-text-inverse);
}

.dialog-header--error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.dialog-header--warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.dialog-header--info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.dialog-header--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.dialog-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.dialog-icon {
  width: 32px;
  height: 32px;
  color: var(--color-text-inverse);
}

.dialog-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-inverse);
  text-align: center;
}

.dialog-content {
  padding: var(--spacing-xl);
}

.dialog-message {
  margin: 0;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  text-align: center;
}

.dialog-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-hover);
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
  min-width: 100px;
  justify-content: center;
}

.btn--primary {
  background: var(--color-primary-gradient);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .alert-dialog {
    width: 95%;
    max-width: none;
  }

  .btn {
    width: 100%;
  }
}
</style>

