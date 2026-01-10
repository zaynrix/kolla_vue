import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/domain'
import { Role } from '@/types/domain'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const users = ref<User[]>([])

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

  function setCurrentUser(user: User | null) {
    currentUser.value = user
    if (user) {
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
      }
    } catch (err) {
      console.error('Failed to restore user from localStorage:', err)
      localStorage.removeItem('currentUser')
    }
  }

  // Call initialize on store creation
  initialize()

  return {
    currentUser,
    users,

    isAuthenticated,
    userRole,
    isWorkflowManager,
    isAdmin,
    isTeamMember,

    setCurrentUser,
    setUsers,
    addUser,
    updateUser,
    removeUser,
    getUserById,
    logout,
  }
})

