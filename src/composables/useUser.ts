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
    // Load users from API if needed
    // For now, users are managed via Actor API
    // This method can be implemented when needed
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


