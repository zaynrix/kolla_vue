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
        deadline: objective.deadlineDate ? new Date(objective.deadlineDate) : undefined,
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
      deadline: objective.deadlineDate ? new Date(objective.deadlineDate) : undefined,
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
          DeadlineDate: request.deadline ?? null,
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
          const responseStr = String(response)
          objectiveGuid = responseStr.trim().replace(/^["']|["']$/g, '')
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
      deadline: objective?.deadlineDate ? new Date(objective.deadlineDate) : (request.deadline ? new Date(request.deadline) : undefined),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async updateWorkflow(
    id: string,
    request: Partial<CreateWorkflowRequest>
  ): Promise<Workflow> {
    console.log('[WorkflowApi] updateWorkflow called with:', { id, request })
    
    const errors: string[] = []
    
    // Update Objective using PATCH endpoints
    if (request.name !== undefined) {
      try {
        console.log('[WorkflowApi] Updating display name:', request.name)
        await this.apiClient.patch<void>(
          `/Objective/SetDisplayName`,
          { Guid: id, DisplayName: request.name }
        )
        console.log('[WorkflowApi] Display name updated successfully')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update display name'
        console.error('[WorkflowApi] Error updating display name:', errorMsg)
        errors.push(`Failed to update name: ${errorMsg}`)
      }
    }
    
    if (request.description !== undefined) {
      try {
        console.log('[WorkflowApi] Updating description:', request.description)
        await this.apiClient.patch<void>(
          `/Objective/SetDescription`,
          { Guid: id, Description: request.description ?? null }
        )
        console.log('[WorkflowApi] Description updated successfully')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update description'
        console.error('[WorkflowApi] Error updating description:', errorMsg)
        errors.push(`Failed to update description: ${errorMsg}`)
      }
    }
    
    // Note: Deadline cannot be updated via API - there's no SetDeadlineDate endpoint
    // The deadline can only be set during creation
    if (request.deadline !== undefined) {
      console.warn('[WorkflowApi] Deadline update requested but SetDeadlineDate endpoint does not exist in API')
      // Don't throw an error, just log a warning - deadline updates are not supported
      // The deadline will remain unchanged
    }
    
    // If any errors occurred, throw an aggregated error
    if (errors.length > 0) {
      const errorMessage = errors.join('; ')
      console.error('[WorkflowApi] Update workflow failed with errors:', errorMessage)
      throw new Error(errorMessage)
    }
    
    // Fetch updated objective
    try {
      console.log('[WorkflowApi] Fetching updated objective:', id)
      const objective = await this.apiClient.get<ObjectiveDto>(
        `/Objective/Get/${id}`
      )
      console.log('[WorkflowApi] Fetched updated objective:', objective)
      
      return {
        id: objective.guid,
        name: objective.displayName,
        description: objective.description,
        workSteps: [],
        objectives: [],
        createdBy: 'system',
        workflowManagerId: 'system',
        tenantId: request.tenantId,
        deadline: objective.deadlineDate ? new Date(objective.deadlineDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch updated workflow'
      console.error('[WorkflowApi] Error fetching updated objective:', errorMsg)
      throw new Error(errorMsg)
    }
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.apiClient.delete<void>(`/Objective/Delete/${id}`)
  }
}

