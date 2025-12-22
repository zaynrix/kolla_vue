/**
 * useUser Composable
 * ViewModel layer - Presentation logic for user management
 * Exposes reactive state and commands for Views
 */

import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import type { User } from '@/types/domain'

export function useUser() {
  const userStore = useUserStore()

  /**
   * Expose reactive state to Views
   */
  const currentUser = computed(() => userStore.currentUser)
  const users = computed(() => userStore.users)
  const availableUsers = computed(() => userStore.users)

  /**
   * Expose commands to Views
   */
  const setCurrentUser = (user: User | null) => {
    userStore.setCurrentUser(user)
  }

  const loadUsers = async () => {
    await userStore.loadUsers()
  }

  const getUserById = (id: string): User | undefined => {
    return userStore.getUserById(id)
  }

  return {
    // Reactive state
    currentUser,
    users,
    availableUsers,

    // Commands
    setCurrentUser,
    loadUsers,
    getUserById,
  }
}

