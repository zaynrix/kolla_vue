import type { ApiClient } from './client'
import type {
  RoleDto,
  CreateRoleRequest,
  UpdateRoleDisplayNameRequest,
  UpdateRoleDescriptionRequest,
  UpdateRoleAdminFlagRequest,
  ApiResponse,
} from '@/types/api'

export class RoleApiService {
  constructor(private apiClient: ApiClient) {}

  async getAllRoles(): Promise<string[]> {
    console.log('[RoleApi] Fetching all roles from /Role/GetAll')
    try {
      const result = await this.apiClient.get<string[]>('/Role/GetAll')
      console.log('[RoleApi] getAllRoles raw result:', result)
      console.log('[RoleApi] Result type:', typeof result, 'IsArray:', Array.isArray(result))
      
      // Ensure we return an array
      if (Array.isArray(result)) {
        console.log('[RoleApi] Returning array with', result.length, 'role GUIDs:', result)
        return result
      }
      
      // If result is not an array, try to handle it
      if (typeof result === 'string') {
        // Might be a JSON string that needs parsing
        try {
          const parsed = JSON.parse(result)
          console.log('[RoleApi] Parsed string result:', parsed)
          if (Array.isArray(parsed)) {
            return parsed
          }
        } catch (parseError) {
          console.warn('[RoleApi] Failed to parse string as JSON:', parseError)
          // Not JSON, return as single item array
          return [result]
        }
      }
      
      // Fallback: return empty array
      console.warn('[RoleApi] Unexpected result format, returning empty array. Result:', result)
      return []
    } catch (error) {
      console.error('[RoleApi] Error in getAllRoles:', error)
      throw error
    }
  }

  async getRole(guid: string): Promise<RoleDto> {
    console.log('[RoleApi] Fetching role details for GUID:', guid)
    console.log('[RoleApi] Full URL will be:', `/Role/Get/${guid}`)
    try {
      const result = await this.apiClient.get<any>(`/Role/Get/${guid}`)
      console.log('[RoleApi] Raw response from getRole:', result)
      console.log('[RoleApi] Response type:', typeof result)
      console.log('[RoleApi] Response keys:', result ? Object.keys(result) : 'null/undefined')
      
      // Map the response to RoleDto format
      const roleDto: RoleDto = {
        guid: result.guid || result.Guid || guid,
        displayName: result.displayName || result.DisplayName || '',
        description: result.description || result.Description || null,
        isAdmin: result.isAdmin !== undefined ? result.isAdmin : (result.IsAdmin !== undefined ? result.IsAdmin : false),
      }
      
      console.log('[RoleApi] Mapped RoleDto:', roleDto)
      return roleDto
    } catch (error) {
      console.error(`[RoleApi] Failed to fetch role ${guid}:`, error)
      // Log full error details
      if (error && typeof error === 'object') {
        console.error('[RoleApi] Error object:', JSON.stringify(error, null, 2))
      }
      throw error
    }
  }

  async createRole(request: CreateRoleRequest): Promise<string> {
    // Format request body exactly as backend expects
    // POST Create(string DisplayName, string? Description, bool IsAdmin): Guid
    const requestBody = {
      DisplayName: request.displayName,
      Description: request.description && request.description.trim() !== '' ? request.description : null,
      IsAdmin: request.isAdmin,
    }
    
    console.log('[RoleApi] Creating role with body:', requestBody)
    
    try {
      const response = await this.apiClient.post<string | { Guid?: string; guid?: string }>('/Role/Create', requestBody)
      
      // Extract GUID from response - backend returns Guid string
      let roleGuid: string
      
      if (typeof response === 'string') {
        // Response is a GUID string
        roleGuid = response.trim().replace(/^["']|["']$/g, '')
      } else if (response && typeof response === 'object') {
        // Response might be an object with Guid or guid property
        roleGuid = (response.Guid || response.guid || '') as string
      } else {
        throw new Error('Unexpected response format from Role/Create')
      }
      
      if (!roleGuid || roleGuid === 'undefined' || roleGuid === 'null' || roleGuid === '') {
        throw new Error('Failed to get role GUID from response')
      }
      
      console.log('[RoleApi] Created role with GUID:', roleGuid)
      return roleGuid
    } catch (createError) {
      console.error('[RoleApi] Error creating role:', createError)
      throw new Error(`Failed to create role: ${createError instanceof Error ? createError.message : 'Unknown error'}`)
    }
  }

  async setRoleDisplayName(guid: string, displayName: string): Promise<void> {
    await this.apiClient.patch<void>(`/Role/SetDisplayName`, {
      Guid: guid,
      DisplayName: displayName,
    })
  }

  async setRoleDescription(guid: string, description?: string | null): Promise<void> {
    await this.apiClient.patch<void>(`/Role/SetDescription`, {
      Guid: guid,
      Description: description ?? null,
    })
  }

  async setRoleAdminFlag(guid: string, isAdmin: boolean): Promise<void> {
    await this.apiClient.patch<void>(`/Role/SetAdminFlag`, {
      Guid: guid,
      IsAdmin: isAdmin,
    })
  }

  async deleteRole(guid: string): Promise<void> {
    await this.apiClient.delete<void>(`/Role/Delete/${guid}`)
  }
}






