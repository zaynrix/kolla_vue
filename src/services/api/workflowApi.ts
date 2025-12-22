/**
 * Workflow API Service
 * Handles all workflow-related API calls
 */

import type { ApiClient } from './client'
import type { Workflow } from '@/types/domain'
import type {
  CreateWorkflowRequest,
  ApiResponse,
  PaginatedResponse,
  ObjectiveDto,
} from '@/types/api'

export class WorkflowApiService {
  constructor(private apiClient: ApiClient) {}

  async getAllWorkflows(): Promise<Workflow[]> {
    // Backend uses Objective for workflows
    const objectiveGuids = await this.apiClient.get<ApiResponse<string[]>>(
      '/Objective/GetAllObjectives'
    )
    
    // Fetch all objectives and map to workflows
    const objectives = await Promise.all(
      objectiveGuids.data.map((guid) =>
        this.apiClient.get<ApiResponse<ObjectiveDto>>(`/Objective/GetObjective/${guid}`)
      )
    )
    
    // Map objectives to workflows
    return objectives.map((response) => {
      const objective = response.data
      return {
        id: objective.guid,
        name: objective.displayName,
        description: objective.description,
        workSteps: [], // Will be loaded separately
        objectives: [],
        createdBy: 'system', // Should come from backend
        workflowManagerId: 'system', // Should come from backend
        tenantId: undefined,
        deadline: undefined, // Should come from backend
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
  }

  async getWorkflowById(id: string): Promise<Workflow> {
    const response = await this.apiClient.get<ApiResponse<ObjectiveDto>>(
      `/Objective/GetObjective/${id}`
    )
    const objective = response.data
    
    return {
      id: objective.guid,
      name: objective.displayName,
      description: objective.description,
      workSteps: [], // Will be loaded separately via Assignment API
      objectives: [],
      createdBy: 'system',
      workflowManagerId: 'system',
      tenantId: undefined,
      deadline: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async createWorkflow(
    request: CreateWorkflowRequest
  ): Promise<Workflow> {
    // Backend uses Objective for workflows
    const objectiveGuid = await this.apiClient.post<ApiResponse<string>>(
      '/Objective/CreateObjective',
      {
        DisplayName: request.name,
        Description: request.description,
      }
    )
    
    // Fetch created objective
    const response = await this.apiClient.get<ApiResponse<ObjectiveDto>>(
      `/Objective/GetObjective/${objectiveGuid.data}`
    )
    const objective = response.data
    
    return {
      id: objective.guid,
      name: objective.displayName,
      description: objective.description,
      workSteps: [],
      objectives: [],
      createdBy: request.workflowManagerId || 'system',
      workflowManagerId: request.workflowManagerId || 'system',
      tenantId: request.tenantId,
      deadline: request.deadline ? new Date(request.deadline) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async updateWorkflow(
    id: string,
    request: Partial<CreateWorkflowRequest>
  ): Promise<Workflow> {
    // Update Objective using PATCH endpoints
    if (request.name) {
      await this.apiClient.patch<ApiResponse<void>>(
        `/Objective/SetObjectiveDisplayName/${id}`,
        { DisplayName: request.name }
      )
    }
    
    if (request.description !== undefined) {
      await this.apiClient.patch<ApiResponse<void>>(
        `/Objective/SetObjectiveDescription/${id}`,
        { Description: request.description }
      )
    }
    
    // Fetch updated objective
    const response = await this.apiClient.get<ApiResponse<ObjectiveDto>>(
      `/Objective/GetObjective/${id}`
    )
    const objective = response.data
    
    return {
      id: objective.guid,
      name: objective.displayName,
      description: objective.description,
      workSteps: [],
      objectives: [],
      createdBy: 'system',
      workflowManagerId: 'system',
      tenantId: request.tenantId,
      deadline: request.deadline ? new Date(request.deadline) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.apiClient.delete<ApiResponse<void>>(`/Objective/DeleteObjective/${id}`)
  }
}

