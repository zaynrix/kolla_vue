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
    return await this.apiClient.get<string[]>('/Objective/GetAll')
  }

  async getObjective(guid: string): Promise<ObjectiveDto> {
    return await this.apiClient.get<ObjectiveDto>(`/Objective/Get/${guid}`)
  }

  async getAllAssignments(guid: string): Promise<string[]> {
    return await this.apiClient.get<string[]>(`/Objective/GetAllAssignments/${guid}`)
  }

  async createObjective(request: CreateObjectiveDtoRequest): Promise<string> {
    return await this.apiClient.post<string>('/Objective/Create', {
      DisplayName: request.displayName,
      Description: request.description ?? null,
    })
  }

  async setObjectiveDisplayName(guid: string, displayName: string): Promise<void> {
    await this.apiClient.patch<void>(`/Objective/SetDisplayName`, {
      Guid: guid,
      DisplayName: displayName,
    })
  }

  async setObjectiveDescription(guid: string, description?: string | null): Promise<void> {
    await this.apiClient.patch<void>(`/Objective/SetDescription`, {
      Guid: guid,
      Description: description ?? null,
    })
  }

  async deleteObjective(guid: string): Promise<void> {
    await this.apiClient.delete<void>(`/Objective/Delete/${guid}`)
  }
}
