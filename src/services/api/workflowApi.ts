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
    const objectiveGuids = await this.apiClient.get<string[]>(
      '/Objective/GetAll'
    )
    
    // Fetch all objectives and map to workflows
    const objectives = await Promise.all(
      objectiveGuids.map((guid) =>
        this.apiClient.get<ObjectiveDto>(`/Objective/Get/${guid}`)
      )
    )
    
    // Map objectives to workflows
    return objectives.map((objective) => {
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
    const objective = await this.apiClient.get<ObjectiveDto>(
      `/Objective/Get/${id}`
    )
    
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
    // POST /Objective/Create returns { "guid": "..." } as JSON
    let objectiveGuid: string
    
    try {
      const response = await this.apiClient.post<{ guid: string }>(
        '/Objective/Create',
        {
          DisplayName: request.name,
          Description: request.description ?? null,
        }
      )
      
      // Extract GUID from response object
      if (response && typeof response === 'object' && 'guid' in response) {
        objectiveGuid = response.guid
      } else if (typeof response === 'string') {
        // Fallback: if it's a string, try to parse it or use it directly
        try {
          const parsed = JSON.parse(response)
          objectiveGuid = parsed.guid || response
        } catch {
          objectiveGuid = response.trim().replace(/^["']|["']$/g, '')
        }
      } else {
        throw new Error('Unexpected response format from Objective/Create')
      }
      
      if (!objectiveGuid || objectiveGuid === 'undefined' || objectiveGuid === 'null') {
        throw new Error('Failed to get objective GUID from response')
      }
      
      console.log('[WorkflowApi] Created objective with GUID:', objectiveGuid)
    } catch (createError) {
      console.error('[WorkflowApi] Error creating objective:', createError)
      throw new Error(`Failed to create workflow: ${createError instanceof Error ? createError.message : 'Unknown error'}`)
    }
    
    // Try to fetch the created objective, but don't fail if this doesn't work
    // The objective was created successfully, so we can return a workflow object
    let objective: ObjectiveDto | null = null
    try {
      // Add a small delay to ensure the objective is available
      await new Promise(resolve => setTimeout(resolve, 200))
      
      objective = await this.apiClient.get<ObjectiveDto>(
        `/Objective/Get/${objectiveGuid}`
      )
      console.log('[WorkflowApi] Successfully fetched created objective:', objective)
    } catch (fetchError) {
      console.warn('[WorkflowApi] Could not fetch created objective immediately, but creation succeeded. GUID:', objectiveGuid, fetchError)
      // Don't throw - the objective was created successfully
      // We'll use the request data to construct the workflow object
    }
    
    // Return workflow object - use fetched data if available, otherwise use request data
    return {
      id: objective?.guid || objectiveGuid,
      name: objective?.displayName || request.name,
      description: objective?.description || request.description,
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
      await this.apiClient.patch<void>(
        `/Objective/SetDisplayName`,
        { Guid: id, DisplayName: request.name }
      )
    }
    
    if (request.description !== undefined) {
      await this.apiClient.patch<void>(
        `/Objective/SetDescription`,
        { Guid: id, Description: request.description ?? null }
      )
    }
    
    // Fetch updated objective
    const objective = await this.apiClient.get<ObjectiveDto>(
      `/Objective/Get/${id}`
    )
    
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
    await this.apiClient.delete<void>(`/Objective/Delete/${id}`)
  }
}

