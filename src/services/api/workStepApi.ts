import type { ApiClient } from './client'
import type { WorkStep, User } from '@/types/domain'
import type {
  CreateWorkStepRequest,
  UpdateWorkStepRequest,
  ApiResponse,
  PaginatedResponse,
  AssignmentDto,
} from '@/types/api'
import { mapAssignmentToWorkStep, mapWorkStepToAssignment, mapStatusToBackend, mapPriorityToBackend } from './mappers'
import { TaskStatus, Priority } from '@/types/domain'
import { AssignmentApiService, type CreateAssignmentParams } from './assignmentApi'

export class WorkStepApiService {
  private assignmentService: AssignmentApiService

  constructor(private apiClient: ApiClient) {
    // Create assignment service instance for validation
    this.assignmentService = new AssignmentApiService(apiClient)
  }

  async getAllWorkSteps(): Promise<WorkStep[]> {
    try {
      // For admin view: Get all assignments using the Assignment API
      // This is more efficient than getting all actors and their assignments
      const allAssignmentGuids = await this.assignmentService.getAllAssignments()
      
      // If no assignments found, return empty array
      if (!allAssignmentGuids || allAssignmentGuids.length === 0) {
        return []
      }
      
      // Fetch all assignment details (use allSettled to handle partial failures)
      const assignmentResults = await Promise.allSettled(
        allAssignmentGuids.map((guid) =>
          this.apiClient.get<AssignmentDto>(`/Assignment/Get/${guid}`)
        )
      )
      
      // Filter successful results and map to work steps
      const assignments = assignmentResults
        .filter((result): result is PromiseFulfilledResult<AssignmentDto> => result.status === 'fulfilled')
        .map(result => result.value)
      
      // Map to work steps
      return assignments.map((assignment, index) => {
        return mapAssignmentToWorkStep(
          assignment,
          assignment.parentObjectiveGuid || 'default-workflow',
          index + 1, // Sequence number - could be improved by getting from workflow
          (assignment.requiredRoleGuid as any) || 'TEAM_MEMBER'
        )
      })
    } catch (error) {
      console.error('Failed to get all work steps:', error)
      // Return empty array instead of throwing, so UI can show "no assignments" message
      return []
    }
  }

  async getWorkStepById(id: string): Promise<WorkStep> {
    const assignment = await this.apiClient.get<AssignmentDto>(
      `/Assignment/Get/${id}`
    )
    
    // Map to WorkStep (requires workflowId and sequenceNumber from context)
    return mapAssignmentToWorkStep(
      assignment,
      assignment.parentObjectiveGuid || 'default-workflow', // Should be provided from context
      1, // Should be provided from context
      (assignment.requiredRoleGuid as any) || 'TEAM_MEMBER'
    )
  }

  async getWorkStepsByWorkflow(workflowId: string): Promise<WorkStep[]> {
    // Backend uses Objective, so fetch objective assignments
    const assignmentGuids = await this.apiClient.get<string[]>(
      `/Objective/GetAllAssignments/${workflowId}`
    )
    
    // Fetch all assignments for this objective/workflow
    const assignments = await Promise.all(
      assignmentGuids.map((guid) =>
        this.apiClient.get<AssignmentDto>(`/Assignment/Get/${guid}`)
      )
    )
    
    // Map to work steps
    return assignments.map((assignment, index) => {
      return mapAssignmentToWorkStep(
        assignment,
        workflowId,
        index + 1,
        (assignment.requiredRoleGuid as any) || 'TEAM_MEMBER'
      )
    })
  }

  async getAssignedWorkSteps(userId: string): Promise<WorkStep[]> {
    try {
      // Get all assignment GUIDs for the actor
      const assignmentGuids = await this.apiClient.get<string[]>(
        `/Actor/GetAllAssignments/${userId}`
      )
      
      // If no assignments, return empty array
      if (!assignmentGuids || assignmentGuids.length === 0) {
        return []
      }
      
      // Fetch all assignments (use allSettled to handle partial failures)
      const assignmentResults = await Promise.allSettled(
        assignmentGuids.map((guid) =>
          this.apiClient.get<AssignmentDto>(`/Assignment/Get/${guid}`)
        )
      )
      
      // Filter successful results and map to work steps
      const assignments = assignmentResults
        .filter((result): result is PromiseFulfilledResult<AssignmentDto> => result.status === 'fulfilled')
        .map(result => result.value)
      
      // Map to work steps
      return assignments.map((assignment, index) => {
        return mapAssignmentToWorkStep(
          assignment,
          assignment.parentObjectiveGuid || 'default-workflow', // Should come from Objective
          index + 1,
          (assignment.requiredRoleGuid as any) || 'TEAM_MEMBER'
        )
      })
    } catch (error) {
      console.error(`Failed to get assigned work steps for user ${userId}:`, error)
      // Return empty array instead of throwing, so UI can show "no assignments" message
      return []
    }
  }

  async createWorkStep(request: CreateWorkStepRequest): Promise<WorkStep> {
    // Map to Assignment API using the assignment service with validation
    // New API uses Duration instead of StartDate/DeadlineDate
    // Calculate duration from dates if provided, otherwise use provided duration
    let duration = request.duration || 8 // Default to 8 hours if not provided
    
    if (request.startDate && request.deadlineDate) {
      // Calculate duration in hours from startDate to deadlineDate
      const startDate = new Date(request.startDate)
      const deadlineDate = new Date(request.deadlineDate)
      
      if (!isNaN(startDate.getTime()) && !isNaN(deadlineDate.getTime()) && deadlineDate > startDate) {
        const diffMs = deadlineDate.getTime() - startDate.getTime()
        duration = Math.round(diffMs / (1000 * 60 * 60)) // Convert to hours
        if (duration <= 0) duration = 1 // Minimum 1 hour
      }
    }
    
    const assignmentParams: CreateAssignmentParams = {
      displayName: request.title,
      description: request.description ?? null,
      duration: duration,
      assigneeGuid: Array.isArray(request.assignedTo) ? request.assignedTo[0] : request.assignedTo ?? null,
      requiredRoleGuid: request.requiredRoleGuid ?? null, // Use GUID from form
      parentObjectiveGuid: request.workflowId ?? null,
      // Legacy support: pass dates for duration calculation if needed
      startDate: request.startDate ?? null,
      deadlineDate: request.deadlineDate ?? null,
    }
    
    const assignmentGuid = await this.assignmentService.createAssignment(assignmentParams)
    
    // Validate that we got a valid GUID string
    if (!assignmentGuid || typeof assignmentGuid !== 'string') {
      console.error('[WorkStepApi] Invalid assignment GUID received:', assignmentGuid)
      throw new Error(`Failed to create assignment: Invalid GUID returned (${typeof assignmentGuid})`)
    }
    
    console.log('[WorkStepApi] Created assignment with GUID:', assignmentGuid)
    
    // Fetch created assignment and map to WorkStep
    const assignment = await this.apiClient.get<AssignmentDto>(
      `/Assignment/Get/${assignmentGuid}`
    )
    
    return mapAssignmentToWorkStep(
      assignment,
      request.workflowId,
      request.sequenceNumber,
      request.requiredRole
    )
  }

  async updateWorkStep(
    id: string,
    request: UpdateWorkStepRequest,
    originalWorkStep?: WorkStep
  ): Promise<WorkStep> {
    console.log('[WorkStepApi] updateWorkStep called with:', { id, request, originalWorkStep })
    
    // Fetch current assignment to get workflowId and sequenceNumber context
    let currentAssignment: AssignmentDto | null = null
    try {
      currentAssignment = await this.apiClient.get<AssignmentDto>(`/Assignment/Get/${id}`)
      console.log('[WorkStepApi] Current assignment:', currentAssignment)
    } catch (err) {
      console.warn('[WorkStepApi] Could not fetch current assignment before update:', err)
    }
    
    // Update Assignment using multiple PATCH calls
    if (request.title) {
      console.log('[WorkStepApi] Updating title:', request.title)
      await this.apiClient.patch<void>(
        `/Assignment/SetDisplayName`,
        { Guid: id, DisplayName: request.title }
      )
    }
    
    if (request.description !== undefined) {
      await this.apiClient.patch<void>(
        `/Assignment/SetDescription`,
        { Guid: id, Description: request.description ?? null }
      )
    }
    
    if (request.assignedTo !== undefined) {
      const assigneeGuid = Array.isArray(request.assignedTo) ? request.assignedTo[0] : request.assignedTo
      await this.apiClient.patch<void>(
        `/Assignment/SetAssignee`,
        { Guid: id, AssigneeGuid: assigneeGuid ?? null }
      )
    }
    
    if (request.status !== undefined) {
      await this.apiClient.patch<void>(
        `/Assignment/SetStatus`,
        { guid: id, assignmentStatus: mapStatusToBackend(request.status) }
      )
    }
    
    // Priority is now always auto-calculated - no manual priority updates allowed
    
    // Note: Assignment API doesn't have SetStartDate or SetDeadlineDate endpoints
    // Only duration can be updated via SetDuration endpoint
    // If dates are provided, calculate duration from them
    
    let durationToSet: number | undefined = undefined
    
    if (request.duration !== undefined && request.duration > 0) {
      // Use explicitly provided duration
      durationToSet = request.duration
    } else if (request.startDate && request.deadlineDate) {
      // Calculate duration from dates if both are provided and duration not explicitly set
      const startDate = new Date(request.startDate)
      const deadlineDate = new Date(request.deadlineDate)
      if (!isNaN(startDate.getTime()) && !isNaN(deadlineDate.getTime()) && deadlineDate > startDate) {
        const diffMs = deadlineDate.getTime() - startDate.getTime()
        const calculatedDuration = Math.round(diffMs / (1000 * 60 * 60))
        if (calculatedDuration > 0) {
          durationToSet = calculatedDuration
        }
      }
    }
    
    // Update duration if we have a value to set
    if (durationToSet !== undefined && durationToSet > 0) {
      console.log('[WorkStepApi] Updating duration:', durationToSet)
      await this.assignmentService.setAssignmentDuration(id, durationToSet)
    }
    
    // Fetch updated assignment
    const assignment = await this.apiClient.get<AssignmentDto>(
      `/Assignment/Get/${id}`
    )
    
    // Map back to WorkStep - preserve original workflowId and sequenceNumber if available
    // Priority: originalWorkStep > currentAssignment > assignment.parentObjectiveGuid
    const workflowId = originalWorkStep?.workflowId 
      || (currentAssignment?.parentObjectiveGuid) 
      || assignment.parentObjectiveGuid 
      || 'default-workflow'
    
    const sequenceNumber = originalWorkStep?.sequenceNumber || 1
    
    return mapAssignmentToWorkStep(
      assignment,
      workflowId,
      sequenceNumber,
      (assignment.requiredRoleGuid as any) || 'TEAM_MEMBER'
    )
  }

  async assignWorkStep(workStepId: string, userId: string): Promise<WorkStep> {
    await this.apiClient.patch<void>(
      `/Assignment/SetAssignee`,
      { Guid: workStepId, AssigneeGuid: userId }
    )
    
    // Fetch updated assignment
    const assignment = await this.apiClient.get<AssignmentDto>(
      `/Assignment/Get/${workStepId}`
    )
    
    return mapAssignmentToWorkStep(
      assignment,
      assignment.parentObjectiveGuid || 'default-workflow', // Should come from context
      1, // Should come from context
      (assignment.requiredRoleGuid as any) || 'TEAM_MEMBER'
    )
  }

  async getAvailableActors(requiredRole: string): Promise<User[]> {
    // Get all actors
    const actorGuids = await this.apiClient.get<string[]>('/Actor/GetAll')
    
    // Fetch all actors and filter by role
    const actorPromises = actorGuids.map((guid) =>
      this.apiClient.get<import('@/types/api').ActorDto>(`/Actor/Get/${guid}`)
    )
    
    const actors = await Promise.all(actorPromises)
    
    // Filter by role and map to Users
    // Note: This requires fetching role information for each actor
    const users: User[] = []
    for (const actor of actors) {
      if (actor.role) {
        // Map role to frontend Role enum and check match
        // For now, simple check - in production would need proper mapping
        if (actor.role.displayName.toLowerCase().includes(requiredRole.toLowerCase())) {
          users.push({
            id: actor.guid,
            username: actor.displayName,
            email: `${actor.displayName}@example.com`,
            role: requiredRole as any,
            tenantId: undefined,
          })
        }
      }
    }
    
    return users
  }

  async deleteWorkStep(id: string): Promise<void> {
    await this.apiClient.delete<void>(`/Assignment/Delete/${id}`)
  }
}

