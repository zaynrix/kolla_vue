import { ApiClient } from './client'
import { WorkflowApiService } from './workflowApi'
import { ObjectiveApiService } from './objectiveApi'
import { WorkStepApiService } from './workStepApi'
import { RoleApiService } from './roleApi'
import { ActorApiService } from './actorApi'
import { AssignmentApiService } from './assignmentApi'
import type { ApiConfig } from './types'

export interface ApiServices {
  workflow: WorkflowApiService
  objective: ObjectiveApiService
  workStep: WorkStepApiService
  role: RoleApiService
  actor: ActorApiService
  assignment: AssignmentApiService
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

const apiBaseURL = import.meta.env.DEV 
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || 'https://kolla-cdb6b0d315ac.herokuapp.com')
console.log('[API Services] Initializing with baseURL:', apiBaseURL)
console.log('[API Services] VITE_API_BASE_URL env var:', import.meta.env.VITE_API_BASE_URL)
console.log('[API Services] Development mode:', import.meta.env.DEV)
console.log('[API Services] Using proxy:', import.meta.env.DEV ? 'YES (/api -> Heroku)' : 'NO (direct)')
if (!import.meta.env.DEV) {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown'
  console.warn('[API Services] Production mode: Backend must allow CORS from:', currentOrigin)
}

export const defaultApiServices: ApiServices = createApiServices({
  baseURL: apiBaseURL,
  timeout: 30000,
})

