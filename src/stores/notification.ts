import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Notification } from '@/types/domain'

const STORAGE_KEY = 'notifications'

// Helper functions for localStorage persistence
function saveNotifications(notifications: Notification[]) {
  try {
    const serialized = JSON.stringify(notifications.map(n => ({
      ...n,
      createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
    })))
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (err) {
    console.error('[NotificationStore] Failed to save notifications:', err)
  }
}

function loadNotifications(): Notification[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.map((n: any) => ({
        ...n,
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
      }))
    }
  } catch (err) {
    console.error('[NotificationStore] Failed to load notifications:', err)
  }
  return []
}

export const useNotificationStore = defineStore('notification', () => {
  // Initialize from localStorage
  const notifications = ref<Notification[]>(loadNotifications())

  // Watch for changes and persist to localStorage
  watch(
    notifications,
    (newNotifications) => {
      saveNotifications(newNotifications)
    },
    { deep: true }
  )

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

  function setNotifications(newNotifications: Notification[]) {
    notifications.value = newNotifications
    saveNotifications(newNotifications)
  }

  function addNotification(notification: Notification) {
    notifications.value.unshift(notification) // Add to beginning
    saveNotifications(notifications.value)
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index >= 0) {
      notifications.value.splice(index, 1)
      saveNotifications(notifications.value)
    }
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) {
      notification.read = true
      saveNotifications(notifications.value)
    }
  }

  function markAllAsRead() {
    notifications.value.forEach((n) => {
      n.read = true
    })
    saveNotifications(notifications.value)
  }

  function clearAll() {
    notifications.value = []
    saveNotifications([])
  }

  function getNotificationById(id: string): Notification | undefined {
    return notifications.value.find((n) => n.id === id)
  }

  return {
    notifications,

    unreadCount,
    unreadNotifications,
    readNotifications,
    notificationsByType,

    setNotifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    getNotificationById,
  }
})






