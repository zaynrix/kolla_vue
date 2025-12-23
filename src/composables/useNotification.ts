/**
 * useNotification Composable
 * ViewModel layer - Presentation logic for notifications
 * Exposes reactive state and commands for Views
 */

import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useUser } from './useUser'
import type { Notification } from '@/types/domain'

export function useNotification() {
  const notificationStore = useNotificationStore()
  const { currentUser } = useUser()

  /**
   * Expose reactive state to Views
   */
  const allNotifications = computed(() => notificationStore.notifications)
  const unreadNotifications = computed(() => {
    if (!currentUser.value) return []
    return notificationStore.unreadNotifications.filter(
      (n) => n.userId === currentUser.value?.id
    )
  })
  const readNotifications = computed(() => {
    if (!currentUser.value) return []
    return notificationStore.readNotifications.filter(
      (n) => n.userId === currentUser.value?.id
    )
  })
  const unreadCount = computed(() => unreadNotifications.value.length)

  /**
   * Expose commands to Views
   */
  const markAsRead = (id: string) => {
    notificationStore.markAsRead(id)
  }

  const markAllAsRead = () => {
    if (!currentUser.value) return
    notificationStore.markAllAsRead()
  }

  const addNotification = (notification: Notification) => {
    notificationStore.addNotification(notification)
  }

  const removeNotification = (id: string) => {
    notificationStore.removeNotification(id)
  }

  const clearNotifications = () => {
    notificationStore.clearAll()
  }

  return {
    // Reactive state
    allNotifications,
    unreadNotifications,
    readNotifications,
    unreadCount,

    // Commands
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearNotifications,
  }
}


