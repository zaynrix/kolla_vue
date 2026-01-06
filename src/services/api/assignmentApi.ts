/**
 * Assignment API Service
 * Complete service for Assignment API endpoints with validation
 * Note: Backend uses "Assignment" terminology, frontend maps to WorkStep
 */

import type { ApiClient } from './client'
import type {
  AssignmentDto,
  CreateAssignmentRequest,
} from '@/types/api'

export interface CreateAssignmentParams {
  displayName: string
  description?: string | null
  startDate?: string | null // ISO date string: "yyyy-MM-ddTHH:mm:ssZ"
  deadlineDate?: string | null // ISO date string: "yyyy-MM-ddTHH:mm:ssZ"
  assigneeGuid?: string | null
  requiredRoleGuid?: string | null
  parentObjectiveGuid?: string | null
}

export class AssignmentApiService {
  constructor(private apiClient: ApiClient) {}

  /**
   * GET /Assignment/GetAll
   * Returns list of assignment GUIDs
   */
  async getAllAssignments(): Promise<string[]> {
    return await this.apiClient.get<string[]>('/Assignment/GetAll')
  }

  /**
   * GET /Assignment/Get/{guid}
   * Returns assignment object
   */
  async getAssignment(guid: string): Promise<AssignmentDto> {
    return await this.apiClient.get<AssignmentDto>(`/Assignment/Get/${guid}`)
  }

  /**
   * POST /Assignment/Create
   * Creates a new assignment
   * Validation:
   * - AssigneeGuid must have matching RequiredRole if both provided
   * - StartDate/DeadlineDate cannot be in past
   * - DeadlineDate > StartDate
   */
  async createAssignment(params: CreateAssignmentParams): Promise<string> {
    // Validate dates
    const now = new Date()
    
    if (params.startDate) {
      const startDate = new Date(params.startDate)
      if (startDate < now) {
        throw new Error('StartDate cannot be in the past')
      }
    }
    
    if (params.deadlineDate) {
      const deadlineDate = new Date(params.deadlineDate)
      if (deadlineDate < now) {
        throw new Error('DeadlineDate cannot be in the past')
      }
      
      if (params.startDate) {
        const startDate = new Date(params.startDate)
        if (deadlineDate <= startDate) {
          throw new Error('DeadlineDate must be after StartDate')
        }
      }
    }

    // Validate assignee/role matching if both provided
    // Note: This validation should ideally check the actor's role matches requiredRoleGuid
    // For now, we'll rely on backend validation, but we can add client-side check if needed
    if (params.assigneeGuid && params.requiredRoleGuid) {
      // Client-side validation would require fetching actor and role details
      // For now, backend will handle this validation
      console.log('[AssignmentApi] AssigneeGuid and RequiredRoleGuid both provided - backend will validate matching')
    }

    // Format dates to "yyyy-MM-ddTHH:mm:ssZ" format
    const formatDate = (dateString: string | null | undefined): string | null => {
      if (!dateString) return null
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null
      
      // Format as "yyyy-MM-ddTHH:mm:ssZ"
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(date.getUTCDate()).padStart(2, '0')
      const hours = String(date.getUTCHours()).padStart(2, '0')
      const minutes = String(date.getUTCMinutes()).padStart(2, '0')
      const seconds = String(date.getUTCSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`
    }

    const requestBody = {
      DisplayName: params.displayName,
      Description: params.description ?? null,
      StartDate: formatDate(params.startDate),
      DeadlineDate: formatDate(params.deadlineDate),
      AssigneeGuid: params.assigneeGuid ?? null,
      RequiredRoleGuid: params.requiredRoleGuid ?? null, // Fixed: should be RequiredRoleGuid, not RequiredRole
      ParentObjectiveGuid: params.parentObjectiveGuid ?? null,
    }

    console.log('[AssignmentApi] Creating assignment:', requestBody)
    const response = await this.apiClient.post<string | { guid?: string }>('/Assignment/Create', requestBody)
    
    // Handle different response formats
    if (typeof response === 'string') {
      return response
    } else if (response && typeof response === 'object' && 'guid' in response && typeof response.guid === 'string') {
      return response.guid
    } else if (response && typeof response === 'object' && 'Guid' in response && typeof (response as any).Guid === 'string') {
      return (response as any).Guid
    } else {
      // Try to extract GUID from object
      const responseStr = JSON.stringify(response)
      console.error('[AssignmentApi] Unexpected response format:', responseStr)
      throw new Error(`Unexpected response format from Assignment/Create: ${responseStr}`)
    }
  }

  async setAssignmentDisplayName(guid: string, displayName: string): Promise<void> {
    await this.apiClient.patch<void>(`/Assignment/SetDisplayName`, {
      Guid: guid,
      DisplayName: displayName,
    })
  }

  async setAssignmentDescription(guid: string, description?: string | null): Promise<void> {
    await this.apiClient.patch<void>(`/Assignment/SetDescription`, {
      Guid: guid,
      Description: description ?? null,
    })
  }

  /**
   * PATCH /Assignment/SetStartDate
   * Format: "yyyy-MM-ddTHH:mm:ssZ"
   */
  async setAssignmentStartDate(guid: string, startDate?: string | null): Promise<void> {
    // Format date to "yyyy-MM-ddTHH:mm:ssZ" format
    const formatDate = (dateString: string | null | undefined): string | null => {
      if (!dateString) return null
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null
      
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(date.getUTCDate()).padStart(2, '0')
      const hours = String(date.getUTCHours()).padStart(2, '0')
      const minutes = String(date.getUTCMinutes()).padStart(2, '0')
      const seconds = String(date.getUTCSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`
    }

    await this.apiClient.patch<void>(`/Assignment/SetStartDate`, {
      Guid: guid,
      StartDate: formatDate(startDate),
    })
  }

  /**
   * PATCH /Assignment/SetDeadlineDate
   * Format: "yyyy-MM-ddTHH:mm:ssZ"
   */
  async setAssignmentDeadlineDate(guid: string, deadlineDate?: string | null): Promise<void> {
    // Format date to "yyyy-MM-ddTHH:mm:ssZ" format
    const formatDate = (dateString: string | null | undefined): string | null => {
      if (!dateString) return null
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null
      
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(date.getUTCDate()).padStart(2, '0')
      const hours = String(date.getUTCHours()).padStart(2, '0')
      const minutes = String(date.getUTCMinutes()).padStart(2, '0')
      const seconds = String(date.getUTCSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`
    }

    await this.apiClient.patch<void>(`/Assignment/SetDeadlineDate`, {
      Guid: guid,
      DeadlineDate: formatDate(deadlineDate),
    })
  }

  async setAssignmentAssignee(guid: string, assigneeGuid?: string | null): Promise<void> {
    await this.apiClient.patch<void>(`/Assignment/SetAssignee`, {
      Guid: guid,
      AssigneeGuid: assigneeGuid ?? null,
    })
  }

  async setAssignmentRequiredRole(guid: string, requiredRoleGuid?: string | null): Promise<void> {
    await this.apiClient.patch<void>(`/Assignment/SetRequiredRole`, {
      Guid: guid,
      RequiredRoleGuid: requiredRoleGuid ?? null,
    })
  }

  /**
   * PATCH /Assignment/SetPriority
   * Priority must be 0, 1, or 2 (0=ShortTerm, 1=MidTerm, 2=LongTerm)
   */
  async setAssignmentPriority(guid: string, priority: number): Promise<void> {
    if (priority !== 0 && priority !== 1 && priority !== 2) {
      throw new Error('Priority must be 0, 1, or 2')
    }
    
    await this.apiClient.patch<void>(`/Assignment/SetPriority`, {
      Guid: guid,
      priority: priority,
    })
  }

  /**
   * PATCH /Assignment/SetStatus
   * Status must be 0, 1, or 2 (0=Planned, 1=InProgress, 2=Completed)
   * Status=2 auto-calculates endDate
   */
  async setAssignmentStatus(guid: string, assignmentStatus: number): Promise<void> {
    if (assignmentStatus !== 0 && assignmentStatus !== 1 && assignmentStatus !== 2) {
      throw new Error('Status must be 0, 1, or 2')
    }
    
    await this.apiClient.patch<void>(`/Assignment/SetStatus`, {
      Guid: guid,
      assignmentStatus: assignmentStatus,
    })
  }

  async setAssignmentParentObjective(guid: string, parentObjectiveGuid?: string | null): Promise<void> {
    await this.apiClient.patch<void>(`/Assignment/SetParentObjective`, {
      Guid: guid,
      ParentObjectiveGuid: parentObjectiveGuid ?? null,
    })
  }

  async deleteAssignment(guid: string): Promise<void> {
    await this.apiClient.delete<void>(`/Assignment/Delete/${guid}`)
  }
}






