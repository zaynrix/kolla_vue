/**
 * Objective API Service
 * Handles all objective-related API calls
 * Note: Backend uses "Objective" terminology, frontend maps to Workflow/WorkStep
 */

import type { ApiClient } from './client'
import type {
  ObjectiveDto,
  CreateObjectiveDtoRequest,
  UpdateObjectiveDisplayNameRequest,
  UpdateObjectiveDescriptionRequest,
  ApiResponse,
  PaginatedResponse,
} from '@/types/api'

export class ObjectiveApiService {
  constructor(private apiClient: ApiClient) {}

  async getAllObjectives(): Promise<string[]> {
    const response = await this.apiClient.get<ApiResponse<string[]>>('/Objective/GetAllObjectives')
    return response.data
  }

  async getObjective(guid: string): Promise<ObjectiveDto> {
    const response = await this.apiClient.get<ApiResponse<ObjectiveDto>>(
      `/Objective/GetObjective/${guid}`
    )
    return response.data
  }

  async getObjectiveAssignments(guid: string): Promise<ObjectiveDto> {
    const response = await this.apiClient.get<ApiResponse<ObjectiveDto>>(
      `/Objective/GetObjectiveAssignments/${guid}`
    )
    return response.data
  }

  async createObjective(request: CreateObjectiveDtoRequest): Promise<string> {
    const response = await this.apiClient.post<ApiResponse<string>>('/Objective/CreateObjective', {
      DisplayName: request.displayName,
      Description: request.description,
    })
    return response.data
  }

  async setObjectiveDisplayName(guid: string, displayName: string): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Objective/SetObjectiveDisplayName/${guid}`, {
      DisplayName: displayName,
    })
  }

  async setObjectiveDescription(guid: string, description?: string): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Objective/SetObjectiveDescription/${guid}`, {
      Description: description,
    })
  }

  async deleteObjective(guid: string): Promise<void> {
    await this.apiClient.delete<ApiResponse<void>>(`/Objective/DeleteObjective/${guid}`)
  }
}
