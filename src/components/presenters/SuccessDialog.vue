<template>
  <transition name="fade">
    <div v-if="show" class="success-dialog-overlay" @click="handleClose">
      <div class="success-dialog" @click.stop>
        <div class="dialog-header">
          <div class="dialog-icon-wrapper">
            <svg class="dialog-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Success',
  message: 'Operation completed successfully!',
})

const emit = defineEmits<{
  close: []
}>()

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.success-dialog-overlay {
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

.success-dialog {
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: var(--color-text-inverse);
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
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
  .success-dialog {
    width: 95%;
    max-width: none;
  }

  .btn {
    width: 100%;
  }
}
</style>

