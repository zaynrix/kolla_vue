<template>
  <transition name="fade">
    <div v-if="show" class="delete-dialog-overlay" @click="handleCancel">
      <div class="delete-dialog" @click.stop>
        <div class="dialog-header">
          <div class="dialog-icon-wrapper">
            <svg class="dialog-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <h2 class="dialog-title">{{ title || 'Delete Item' }}</h2>
        </div>
        
        <div class="dialog-content">
          <p class="dialog-message">
            Are you sure you want to delete <strong>{{ itemName }}</strong>? This action cannot be undone and all associated data will be permanently removed.
          </p>
          <div class="dialog-warning">
            <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <span>This action is irreversible</span>
          </div>
        </div>
        
        <div class="dialog-actions">
          <button @click="handleCancel" class="btn btn--secondary">
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>Cancel</span>
          </button>
          <button @click="handleConfirm" class="btn btn--danger">
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            <span>{{ confirmButtonText || 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  itemName: string
  title?: string
  confirmButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Delete Item',
  confirmButtonText: 'Delete'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.delete-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.delete-dialog {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--color-border);
  max-width: 480px;
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
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
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
  color: white;
}

.dialog-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: white;
  text-align: center;
}

.dialog-content {
  padding: var(--spacing-xl);
}

.dialog-message {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  line-height: var(--leading-relaxed);
  text-align: center;
}

.dialog-message strong {
  color: var(--color-danger);
  font-weight: var(--font-bold);
}

.dialog-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

.warning-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.dialog-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-hover);
  justify-content: flex-end;
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
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.btn--secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn--secondary:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn--danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn--danger:hover {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
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
  .delete-dialog {
    width: 95%;
    max-width: none;
  }

  .dialog-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

