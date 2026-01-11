import type { ApiClient } from './client'
import type {
  AssignmentDto,
  CreateAssignmentRequest,
} from '@/types/api'

export interface CreateAssignmentParams {
  displayName: string
  description?: string | null
  duration: number // Duration in hours
  assigneeGuid?: string | null
  requiredRoleGuid?: string | null // Will be sent as "RequiredRole" in API
  parentObjectiveGuid?: string | null
  // Legacy support: if startDate/deadlineDate are provided, duration will be calculated
  startDate?: string | null // ISO date string: "yyyy-MM-ddTHH:mm:ssZ" - for calculating duration
  deadlineDate?: string | null // ISO date string: "yyyy-MM-ddTHH:mm:ssZ" - for calculating duration
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
   * New API: POST Create(string DisplayName, string? Description, int Duration, Guid? AssigneeGuid, Guid? RequiredRole, Guid? ParentObjectiveGuid): Guid
   * Validation:
   * - AssigneeGuid must have matching RequiredRole if both provided (backend validates)
   */
  async createAssignment(params: CreateAssignmentParams): Promise<string> {
    // Calculate duration from dates if provided, otherwise use provided duration
    let duration = params.duration
    
    if (params.startDate && params.deadlineDate) {
      // Calculate duration in hours from startDate to deadlineDate
      const startDate = new Date(params.startDate)
      const deadlineDate = new Date(params.deadlineDate)
      
      if (isNaN(startDate.getTime()) || isNaN(deadlineDate.getTime())) {
        throw new Error('Invalid date format for startDate or deadlineDate')
      }
      
      if (deadlineDate <= startDate) {
        throw new Error('DeadlineDate must be after StartDate')
      }
      
      // Calculate duration in hours
      const diffMs = deadlineDate.getTime() - startDate.getTime()
      const diffHours = Math.round(diffMs / (1000 * 60 * 60))
      
      if (diffHours <= 0) {
        throw new Error('Duration must be at least 1 hour')
      }
      
      duration = diffHours
      console.log('[AssignmentApi] Calculated duration from dates:', duration, 'hours')
    } else if (!duration || duration <= 0) {
      throw new Error('Duration must be provided and greater than 0')
    }

    // Validate assignee/role matching if both provided
    // Backend will validate that Assignee's role matches RequiredRole
    if (params.assigneeGuid && params.requiredRoleGuid) {
      console.log('[AssignmentApi] AssigneeGuid and RequiredRole both provided - backend will validate matching')
    }

    const requestBody = {
      DisplayName: params.displayName,
      Description: params.description ?? null,
      Duration: duration,
      AssigneeGuid: params.assigneeGuid ?? null,
      RequiredRole: params.requiredRoleGuid ?? null, // API uses "RequiredRole" but it's still a GUID
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
   * PATCH /Assignment/SetDuration
   * Sets the duration of an assignment in hours
   */
  async setAssignmentDuration(guid: string, duration: number): Promise<void> {
    if (duration <= 0) {
      throw new Error('Duration must be greater than 0')
    }
    
    await this.apiClient.patch<void>(`/Assignment/SetDuration`, {
      Guid: guid,
      Duration: duration,
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
   * Request body: { "guid": "...", "priority": 1 }
   */
  async setAssignmentPriority(guid: string, priority: number): Promise<void> {
    if (priority !== 0 && priority !== 1 && priority !== 2) {
      throw new Error('Priority must be 0, 1, or 2')
    }
    
    await this.apiClient.patch<void>(`/Assignment/SetPriority`, {
      guid: guid,
      priority: priority,
    })
  }

  /**
   * PATCH /Assignment/SetStatus
   * Status must be 0, 1, or 2 (0=Planned, 1=InProgress, 2=Completed)
   * Status=2 auto-calculates endDate
   * Request body: { "guid": "...", "assignmentStatus": 0 }
   */
  async setAssignmentStatus(guid: string, assignmentStatus: number): Promise<void> {
    if (assignmentStatus !== 0 && assignmentStatus !== 1 && assignmentStatus !== 2) {
      throw new Error('Status must be 0, 1, or 2')
    }
    
    await this.apiClient.patch<void>(`/Assignment/SetStatus`, {
      guid: guid,
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






