/**
 * Notification Store - Model Layer
 * Centralized reactive state management for notifications
 * Supports real-time updates via WebSocket or polling
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '@/types/domain'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([])

  // Getters
  const unreadCount = computed(() => {
    return notifications.value.filter((n) => !n.read).length
  })

  const unreadNotifications = computed(() => {
    return notifications.value.filter((n) => !n.read)
  })

  const readNotifications = computed(() => {
    return notifications.value.filter((n) => n.read)
  })

  const notificationsByType = computed(() => {
    return {
      INFO: notifications.value.filter((n) => n.type === 'INFO'),
      WARNING: notifications.value.filter((n) => n.type === 'WARNING'),
      ERROR: notifications.value.filter((n) => n.type === 'ERROR'),
      SUCCESS: notifications.value.filter((n) => n.type === 'SUCCESS'),
    }
  })

  // Actions
  function setNotifications(newNotifications: Notification[]) {
    notifications.value = newNotifications
  }

  function addNotification(notification: Notification) {
    notifications.value.unshift(notification) // Add to beginning
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index >= 0) {
      notifications.value.splice(index, 1)
    }
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  function markAllAsRead() {
    notifications.value.forEach((n) => {
      n.read = true
    })
  }

  function clearAll() {
    notifications.value = []
  }

  function getNotificationById(id: string): Notification | undefined {
    return notifications.value.find((n) => n.id === id)
  }

  return {
    // State
    notifications,

    // Getters
    unreadCount,
    unreadNotifications,
    readNotifications,
    notificationsByType,

    // Actions
    setNotifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    getNotificationById,
  }
})






