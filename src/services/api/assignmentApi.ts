/**
 * Assignment API Service
 * Handles all assignment-related API calls
 * Note: Backend uses "Assignment" terminology, frontend maps to WorkStep
 */

import type { ApiClient } from './client'
import type {
  AssignmentDto,
  CreateAssignmentRequest,
  UpdateAssignmentDisplayNameRequest,
  UpdateAssignmentDescriptionRequest,
  UpdateAssignmentStartDateRequest,
  UpdateAssignmentDeadlineDateRequest,
  UpdateAssignmentAssigneeRequest,
  UpdateAssignmentPriorityRequest,
  UpdateAssignmentStatusRequest,
  ApiResponse,
  PaginatedResponse,
} from '@/types/api'

export class AssignmentApiService {
  constructor(private apiClient: ApiClient) {}

  async getAllAssignments(): Promise<string[]> {
    const response = await this.apiClient.get<ApiResponse<string[]>>('/Assignment/GetAllAssignments')
    return response.data
  }

  async getAssignment(guid: string): Promise<AssignmentDto> {
    const response = await this.apiClient.get<ApiResponse<AssignmentDto>>(
      `/Assignment/GetAssignment/${guid}`
    )
    return response.data
  }

  async createAssignment(request: CreateAssignmentRequest): Promise<string> {
    const response = await this.apiClient.post<ApiResponse<string>>('/Assignment/CreateAssignment', {
      DisplayName: request.displayName,
      Description: request.description,
      StartDate: request.startDate,
      DeadlineDate: request.deadlineDate,
      ActorGuid: request.actorGuid,
      RequiredRole: request.requiredRole,
    })
    return response.data
  }

  async setAssignmentDisplayName(guid: string, displayName: string): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Assignment/SetAssignmentDisplayName/${guid}`, {
      DisplayName: displayName,
    })
  }

  async setAssignmentDescription(guid: string, description?: string): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Assignment/SetAssignmentDescription/${guid}`, {
      Description: description,
    })
  }

  async setAssignmentStartDate(guid: string, startDate?: string): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Assignment/SetAssignmentStartDate/${guid}`, {
      StartDate: startDate,
    })
  }

  async setAssignmentDeadlineDate(guid: string, deadlineDate?: string): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Assignment/SetAssignmentDeadlineDate/${guid}`, {
      DeadlineDate: deadlineDate,
    })
  }

  async setAssignmentAssignee(guid: string, assigneeGuid?: string | string[]): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Assignment/SetAssignmentAssignee/${guid}`, {
      AssigneeGuid: assigneeGuid,
    })
  }

  async setAssignmentPriority(guid: string, priority?: number): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Assignment/SetAssignmentPriority/${guid}`, {
      priority,
    })
  }

  async setAssignmentStatus(guid: string, assignmentStatus?: number): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Assignment/SetAssignmentStatus/${guid}`, {
      assignmentStatus,
    })
  }

  async deleteAssignment(guid: string): Promise<void> {
    await this.apiClient.delete<ApiResponse<void>>(`/Assignment/DeleteAssignment/${guid}`)
  }
}




