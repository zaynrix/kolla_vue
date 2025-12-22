/**
 * API Services - Centralized API service exports
 * Supports dependency injection for testability
 */

import { ApiClient } from './client'
import { WorkflowApiService } from './workflowApi'
import { ObjectiveApiService } from './objectiveApi'
import { WorkStepApiService } from './workStepApi'
import { RoleApiService } from './roleApi'
import { ActorApiService } from './actorApi'
import { AssignmentApiService } from './assignmentApi'
import { MockApiClient } from './mockApiClient'
import { MockWorkflowApiService } from './mockWorkflowApi'
import { MockWorkStepApiService } from './mockWorkStepApi'
import { MockRoleApiService } from './mockRoleApi'
import { MockActorApiService } from './mockActorApi'
import { MockAssignmentApiService } from './mockAssignmentApi'
import type { ApiConfig } from './types'

export interface ApiServices {
  workflow: WorkflowApiService | MockWorkflowApiService
  objective: ObjectiveApiService
  workStep: WorkStepApiService | MockWorkStepApiService
  role: RoleApiService | MockRoleApiService
  actor: ActorApiService | MockActorApiService
  assignment: AssignmentApiService | MockAssignmentApiService
}

export function createApiServices(config: ApiConfig): ApiServices {
  const apiClient = new ApiClient(config)
  return {
    workflow: new WorkflowApiService(apiClient),
    objective: new ObjectiveApiService(apiClient),
    workStep: new WorkStepApiService(apiClient),
    role: new RoleApiService(apiClient),
    actor: new ActorApiService(apiClient),
    assignment: new AssignmentApiService(apiClient),
  }
}

export function createMockApiServices(): ApiServices {
  const mockClient = new MockApiClient()
  return {
    workflow: new MockWorkflowApiService(mockClient),
    objective: new ObjectiveApiService(new ApiClient({ baseURL: '' })), // Not used in prototype
    workStep: new MockWorkStepApiService(mockClient),
    role: new MockRoleApiService(),
    actor: new MockActorApiService(),
    assignment: new MockAssignmentApiService(),
  }
}

// Use mock services for prototyping
// Set VITE_USE_MOCK_API=false to use real API
const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

// Default instance (can be overridden via dependency injection)
export const defaultApiServices: ApiServices = useMockApi
  ? createMockApiServices()
  : createApiServices({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
      timeout: 30000,
    })

