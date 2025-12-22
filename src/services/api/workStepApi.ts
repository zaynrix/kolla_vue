/**
 * WorkStep API Service
 * Handles all work step-related API calls
 */

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

export class WorkStepApiService {
  constructor(private apiClient: ApiClient) {}

  async getAllWorkSteps(): Promise<WorkStep[]> {
    const response = await this.apiClient.get<
      ApiResponse<PaginatedResponse<WorkStep>>
    >('/worksteps')
    return response.data.data
  }

  async getWorkStepById(id: string): Promise<WorkStep> {
    const response = await this.apiClient.get<ApiResponse<AssignmentDto>>(
      `/Assignment/GetAssignment/${id}`
    )
    const assignment = response.data
    
    // Map to WorkStep (requires workflowId and sequenceNumber from context)
    return mapAssignmentToWorkStep(
      assignment,
      'default-workflow', // Should be provided from context
      1, // Should be provided from context
      (assignment.requiredRole as any) || 'TEAM_MEMBER'
    )
  }

  async getWorkStepsByWorkflow(workflowId: string): Promise<WorkStep[]> {
    // Backend uses Objective, so fetch objective assignments
    const objectiveResponse = await this.apiClient.get<ApiResponse<import('@/types/api').ObjectiveDto>>(
      `/Objective/GetObjectiveAssignments/${workflowId}`
    )
    
    // Get all assignments for this objective/workflow
    const assignmentGuids = await this.apiClient.get<ApiResponse<string[]>>(
      '/Assignment/GetAllAssignments'
    )
    
    // Filter and fetch assignments (in real implementation, backend would filter)
    const assignments = await Promise.all(
      assignmentGuids.data.map((guid) =>
        this.apiClient.get<ApiResponse<AssignmentDto>>(`/Assignment/GetAssignment/${guid}`)
      )
    )
    
    // Map to work steps (filtering by workflow would be done on backend in production)
    return assignments.map((response, index) => {
      const assignment = response.data
      return mapAssignmentToWorkStep(
        assignment,
        workflowId,
        index + 1,
        (assignment.requiredRole as any) || 'TEAM_MEMBER'
      )
    })
  }

  async getAssignedWorkSteps(userId: string): Promise<WorkStep[]> {
    // Get all assignments for the actor
    const assignmentsResponse = await this.apiClient.get<ApiResponse<PaginatedResponse<AssignmentDto>>>(
      '/Actor/GetAssignments'
    )
    
    // Filter assignments assigned to this user
    const userAssignments = assignmentsResponse.data.data.filter((assignment) => {
      if (!assignment.actorGuid) return false
      if (Array.isArray(assignment.actorGuid)) {
        return assignment.actorGuid.includes(userId)
      }
      return assignment.actorGuid === userId
    })
    
    // Map to work steps
    return userAssignments.map((assignment, index) => {
      return mapAssignmentToWorkStep(
        assignment,
        'default-workflow', // Should come from Objective
        index + 1,
        (assignment.requiredRole as any) || 'TEAM_MEMBER'
      )
    })
  }

  async createWorkStep(request: CreateWorkStepRequest): Promise<WorkStep> {
    // Map to Assignment API
    const assignmentGuid = await this.apiClient.post<ApiResponse<string>>(
      '/Assignment/CreateAssignment',
      {
        DisplayName: request.title,
        Description: request.description,
        ActorGuid: request.assignedTo,
        RequiredRole: request.requiredRole,
        // StartDate and DeadlineDate would come from workflow
      }
    )
    
    // Fetch created assignment and map to WorkStep
    const assignmentResponse = await this.apiClient.get<ApiResponse<AssignmentDto>>(
      `/Assignment/GetAssignment/${assignmentGuid.data}`
    )
    
    return mapAssignmentToWorkStep(
      assignmentResponse.data,
      request.workflowId,
      request.sequenceNumber,
      request.requiredRole
    )
  }

  async updateWorkStep(
    id: string,
    request: UpdateWorkStepRequest
  ): Promise<WorkStep> {
    // Update Assignment using multiple PATCH calls
    if (request.title) {
      await this.apiClient.patch<ApiResponse<void>>(
        `/Assignment/SetAssignmentDisplayName/${id}`,
        { DisplayName: request.title }
      )
    }
    
    if (request.description !== undefined) {
      await this.apiClient.patch<ApiResponse<void>>(
        `/Assignment/SetAssignmentDescription/${id}`,
        { Description: request.description }
      )
    }
    
    if (request.assignedTo !== undefined) {
      await this.apiClient.patch<ApiResponse<void>>(
        `/Assignment/SetAssignmentAssignee/${id}`,
        { AssigneeGuid: request.assignedTo }
      )
    }
    
    if (request.status !== undefined) {
      await this.apiClient.patch<ApiResponse<void>>(
        `/Assignment/SetAssignmentStatus/${id}`,
        { assignmentStatus: mapStatusToBackend(request.status) }
      )
    }
    
    if (request.manualPriority !== undefined) {
      await this.apiClient.patch<ApiResponse<void>>(
        `/Assignment/SetAssignmentPriority/${id}`,
        { priority: mapPriorityToBackend(request.manualPriority) }
      )
    }
    
    // Fetch updated assignment
    const response = await this.apiClient.get<ApiResponse<AssignmentDto>>(
      `/Assignment/GetAssignment/${id}`
    )
    
    // Map back to WorkStep (requires workflowId and sequenceNumber from context)
    // In real implementation, these should be stored or fetched
    return mapAssignmentToWorkStep(
      response.data,
      'default-workflow', // Should come from context
      1, // Should come from context
      (response.data.requiredRole as any) || 'TEAM_MEMBER'
    )
  }

  async assignWorkStep(workStepId: string, userId: string): Promise<WorkStep> {
    await this.apiClient.patch<ApiResponse<void>>(
      `/Assignment/SetAssignmentAssignee/${workStepId}`,
      { AssigneeGuid: userId }
    )
    
    // Fetch updated assignment
    const response = await this.apiClient.get<ApiResponse<AssignmentDto>>(
      `/Assignment/GetAssignment/${workStepId}`
    )
    
    return mapAssignmentToWorkStep(
      response.data,
      'default-workflow', // Should come from context
      1, // Should come from context
      (response.data.requiredRole as any) || 'TEAM_MEMBER'
    )
  }

  async getAvailableActors(requiredRole: string): Promise<User[]> {
    // Get all actors
    const actorGuids = await this.apiClient.get<ApiResponse<string[]>>('/Actor/GetAllActors')
    
    // Fetch all actors and filter by role
    const actorPromises = actorGuids.data.map((guid) =>
      this.apiClient.get<ApiResponse<import('@/types/api').ActorDto>>(`/Actor/GetActor/${guid}`)
    )
    
    const actors = await Promise.all(actorPromises)
    
    // Filter by role and map to Users
    // Note: This requires fetching role information for each actor
    const users: User[] = []
    for (const actorResponse of actors) {
      const actor = actorResponse.data
      if (actor.roleGuid) {
        // Fetch role to check if it matches requiredRole
        const roleResponse = await this.apiClient.get<ApiResponse<import('@/types/api').RoleDto>>(
          `/Role/GetRole/${actor.roleGuid}`
        )
        const role = roleResponse.data
        
        // Map role to frontend Role enum and check match
        // For now, simple check - in production would need proper mapping
        if (role.displayName.toLowerCase().includes(requiredRole.toLowerCase())) {
          users.push({
            id: actor.guid,
            username: actor.nickname,
            email: `${actor.nickname}@example.com`,
            role: requiredRole as any,
            tenantId: undefined,
          })
        }
      }
    }
    
    return users
  }

  async deleteWorkStep(id: string): Promise<void> {
    await this.apiClient.delete<ApiResponse<void>>(`/Assignment/DeleteAssignment/${id}`)
  }
}

