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
      console.log('[useRole] Loading roles...')
      const roleGuids = await api.role.getAllRoles()
      console.log('[useRole] Got role GUIDs:', roleGuids)
      
      if (!Array.isArray(roleGuids) || roleGuids.length === 0) {
        console.log('[useRole] No roles found')
        roles.value = []
        return
      }
      
      const loadedRoles = await Promise.allSettled(
        roleGuids.map(async (guid: string) => {
          try {
            console.log('[useRole] Loading role:', guid)
            const role = await api.role.getRole(guid)
            console.log('[useRole] Successfully loaded role:', guid, role)
            return role
          } catch (err) {
            console.error(`[useRole] Failed to load role ${guid}:`, err)
            throw err
          }
        })
      )
      
      // Filter out failed requests and log them
      const successfulRoles = loadedRoles
        .filter((result): result is PromiseFulfilledResult<RoleDto> => result.status === 'fulfilled')
        .map(result => result.value)
      
      const failedRoles = loadedRoles.filter(result => result.status === 'rejected')
      if (failedRoles.length > 0) {
        console.warn(`[useRole] Failed to load ${failedRoles.length} out of ${roleGuids.length} roles`)
        failedRoles.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`[useRole] Failed role GUID: ${roleGuids[index]}`, result.reason)
          }
        })
      }
      
      console.log('[useRole] Successfully loaded', successfulRoles.length, 'roles:', successfulRoles)
      
      roles.value = successfulRoles
      
      // If some roles failed but we have at least some successful ones, don't throw error
      // Only throw if ALL roles failed
      if (successfulRoles.length === 0 && roleGuids.length > 0) {
        throw new Error(`Failed to load any roles. ${failedRoles.length} role(s) failed.`)
      }
    } catch (err) {
      console.error('[useRole] Error loading roles:', err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null && 'message' in err
        ? String(err.message)
        : 'Failed to load roles'
      error.value = new Error(errorMessage)
      console.error('[useRole] Error details:', {
        message: errorMessage,
        error: err,
        stack: err instanceof Error ? err.stack : undefined
      })
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

