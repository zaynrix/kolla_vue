/**
 * User Store - Model Layer
 * Centralized reactive state management for user and role information
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/domain'
import { Role } from '@/types/domain'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null)
  const users = ref<User[]>([])

  // Getters
  const isAuthenticated = computed(() => currentUser.value !== null)

  const userRole = computed(() => currentUser.value?.role || null)

  const isWorkflowManager = computed(() => {
    return currentUser.value?.role === Role.WORKFLOW_MANAGER
  })

  const isAdmin = computed(() => {
    return currentUser.value?.role === Role.ADMIN
  })

  const isTeamMember = computed(() => {
    return currentUser.value?.role === Role.TEAM_MEMBER
  })

  // Actions
  function setCurrentUser(user: User | null) {
    currentUser.value = user
    // Save to localStorage for persistence across page reloads
    if (user) {
      // Store actorGuid for restoration
      const actorGuid = user.id // user.id is the actor guid
      localStorage.setItem('currentUser', JSON.stringify({ 
        actorGuid,
        displayName: user.username 
      }))
    } else {
      localStorage.removeItem('currentUser')
    }
  }

  function setUsers(newUsers: User[]) {
    users.value = newUsers
  }

  function addUser(user: User) {
    users.value.push(user)
  }

  function updateUser(user: User) {
    const index = users.value.findIndex((u) => u.id === user.id)
    if (index >= 0) {
      users.value[index] = user
    }
  }

  function removeUser(id: string) {
    const index = users.value.findIndex((u) => u.id === id)
    if (index >= 0) {
      users.value.splice(index, 1)
    }
  }

  function getUserById(id: string): User | undefined {
    return users.value.find((u) => u.id === id)
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  // Initialize: restore user from localStorage
  function initialize() {
    try {
      const saved = localStorage.getItem('currentUser')
      if (saved) {
        const { actorGuid, displayName } = JSON.parse(saved)
        // User will be restored by the app on mount
        // This just marks that we should restore
      }
    } catch (err) {
      console.error('Failed to restore user from localStorage:', err)
      localStorage.removeItem('currentUser')
    }
  }

  // Call initialize on store creation
  initialize()

  return {
    // State
    currentUser,
    users,

    // Getters
    isAuthenticated,
    userRole,
    isWorkflowManager,
    isAdmin,
    isTeamMember,

    // Actions
    setCurrentUser,
    setUsers,
    addUser,
    updateUser,
    removeUser,
    getUserById,
    logout,
  }
})

