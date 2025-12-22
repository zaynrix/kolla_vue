<!--
  NotificationPanel - Container Component
  Shows notifications for current user with real-time updates
-->
<template>
  <div v-if="showPanel" class="notification-panel">
    <div class="notification-panel__header">
      <h3>Notifications</h3>
      <button @click="markAllAsRead" class="btn-mark-all">Mark all as read</button>
    </div>
    <div class="notification-panel__content">
      <div v-if="unreadNotifications.length === 0 && readNotifications.length === 0" class="empty-state">
        <p>No notifications</p>
      </div>
      <div v-else>
        <div v-if="unreadNotifications.length > 0" class="notification-section">
          <h4>Unread</h4>
          <div
            v-for="notification in unreadNotifications"
            :key="notification.id"
            class="notification-item notification-item--unread"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon" :class="`notification-icon--${notification.type.toLowerCase()}`">
              {{ getNotificationIcon(notification.type) }}
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
            </div>
            <button @click.stop="markAsRead(notification.id)" class="btn-mark-read">✓</button>
          </div>
        </div>
        <div v-if="readNotifications.length > 0" class="notification-section">
          <h4>Read</h4>
          <div
            v-for="notification in readNotifications.slice(0, 5)"
            :key="notification.id"
            class="notification-item"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon" :class="`notification-icon--${notification.type.toLowerCase()}`">
              {{ getNotificationIcon(notification.type) }}
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'
import type { Notification } from '@/types/domain'

interface Props {
  showPanel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPanel: true,
})

// ViewModel: Exposes reactive state and commands
const viewModel = useNotification()

// Expose ViewModel state and commands to template
const { unreadNotifications, readNotifications, markAsRead, markAllAsRead } = viewModel

function handleNotificationClick(notification: Notification) {
  markAsRead(notification.id)
  // Could navigate to related entity
  if (notification.workflowId) {
    // Navigate to workflow
    console.log('Navigate to workflow:', notification.workflowId)
  } else if (notification.workStepId) {
    // Navigate to work step
    console.log('Navigate to work step:', notification.workStepId)
  }
}

function getNotificationIcon(type: string): string {
  const icons = {
    INFO: 'ℹ️',
    SUCCESS: '✅',
    WARNING: '⚠️',
    ERROR: '❌',
  }
  return icons[type as keyof typeof icons] || '📢'
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}
</script>

<style scoped>
.notification-panel {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border-light);
  max-width: 400px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.notification-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.notification-panel__header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
}

.btn-mark-all {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: var(--font-medium);
}

.btn-mark-all:hover {
  text-decoration: underline;
}

.notification-panel__content {
  overflow-y: auto;
  flex: 1;
}

.notification-section {
  padding: var(--spacing-md);
}

.notification-section h4 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.notification-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid transparent;
}

.notification-item:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border);
}

.notification-item--unread {
  background: var(--color-info-light);
  border-color: var(--color-info);
}

.notification-icon {
  font-size: var(--text-xl);
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  font-size: var(--text-sm);
}

.notification-message {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-xs);
  line-height: var(--leading-normal);
}

.notification-time {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.btn-mark-read {
  padding: var(--spacing-xs);
  background: var(--color-success);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-sm);
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-mark-read:hover {
  background: var(--color-success);
  opacity: 0.8;
}

.empty-state {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-tertiary);
}
</style>



