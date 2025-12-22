/**
 * Role API Service
 * Handles all role-related API calls
 */

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
    const response = await this.apiClient.get<ApiResponse<string[]>>('/Role/GetAllRoles')
    return response.data
  }

  async getRole(guid: string): Promise<RoleDto> {
    const response = await this.apiClient.get<ApiResponse<RoleDto>>(`/Role/GetRole/${guid}`)
    return response.data
  }

  async createRole(request: CreateRoleRequest): Promise<string> {
    const response = await this.apiClient.post<ApiResponse<string>>('/Role/CreateRole', {
      DisplayName: request.displayName,
      isAdmin: request.isAdmin,
      Description: request.description,
    })
    return response.data
  }

  async setRoleDisplayName(guid: string, displayName: string): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Role/SetRoleDisplayName/${guid}`, {
      DisplayName: displayName,
    })
  }

  async setRoleDescription(guid: string, description?: string): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Role/SetRoleDescription/${guid}`, {
      Description: description,
    })
  }

  async setRoleAdminFlag(guid: string, isAdmin: boolean): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Role/SetRoleAdminFlag/${guid}`, {
      isAdmin,
    })
  }

  async deleteRole(guid: string): Promise<void> {
    await this.apiClient.delete<ApiResponse<void>>(`/Role/DeleteRole/${guid}`)
  }
}



