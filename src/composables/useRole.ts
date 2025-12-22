/**
 * useRole Composable
 * ViewModel layer - Business logic for role management
 */

import { ref, computed } from 'vue'
import { useApi } from './useApi'
import type { RoleDto, CreateRoleRequest } from '@/types/api'

export function useRole() {
  const api = useApi()
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const roles = ref<RoleDto[]>([])

  /**
   * Load all roles from API
   */
  const loadRoles = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const roleGuids = await api.role.getAllRoles()
      const loadedRoles = await Promise.all(
        roleGuids.map((guid: string) => api.role.getRole(guid))
      )
      roles.value = loadedRoles
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load roles')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get a specific role by GUID
   */
  const getRole = async (guid: string): Promise<RoleDto> => {
    loading.value = true
    error.value = null
    try {
      const role = await api.role.getRole(guid)
      return role
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load role')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new role
   */
  const createRole = async (request: CreateRoleRequest): Promise<string> => {
    loading.value = true
    error.value = null
    try {
      const roleGuid = await api.role.createRole(request)
      await loadRoles() // Reload roles list
      return roleGuid
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to create role')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update role display name
   */
  const updateRoleDisplayName = async (guid: string, displayName: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.role.setRoleDisplayName(guid, displayName)
      await loadRoles() // Reload roles list
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update role')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update role description
   */
  const updateRoleDescription = async (guid: string, description?: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.role.setRoleDescription(guid, description)
      await loadRoles() // Reload roles list
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update role')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update role admin flag
   */
  const updateRoleAdminFlag = async (guid: string, isAdmin: boolean): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.role.setRoleAdminFlag(guid, isAdmin)
      await loadRoles() // Reload roles list
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update role')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a role
   */
  const deleteRole = async (guid: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.role.deleteRole(guid)
      await loadRoles() // Reload roles list
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to delete role')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    roles: computed(() => roles.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Actions
    loadRoles,
    getRole,
    createRole,
    updateRoleDisplayName,
    updateRoleDescription,
    updateRoleAdminFlag,
    deleteRole,
  }
}

