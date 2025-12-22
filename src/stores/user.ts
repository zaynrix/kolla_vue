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
  }

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

