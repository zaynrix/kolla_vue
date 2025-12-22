/**
 * Authorization Types
 * Role-based access control for work steps
 */

import type { WorkStep as DomainWorkStep } from './domain'
import type { User } from './domain'

export interface Permission {
  resource: 'WORKSTEP' | 'WORKFLOW' | 'USER' | 'NOTIFICATION'
  action: 'READ' | 'WRITE' | 'DELETE' | 'ASSIGN' | 'MANAGE'
  condition?: (user: User, resource: unknown) => boolean
}

export interface AuthorizationResult {
  allowed: boolean
  reason?: string
}

/**
 * Authorization service interface
 * Checks if user has permission to access work step
 * Must respond in ≤0.5 seconds (Security requirement)
 */
export interface IAuthorizationService {
  canAccessWorkStep(user: User, workStep: DomainWorkStep): AuthorizationResult
  canAssignWorkStep(user: User, workStep: DomainWorkStep, assigneeId: string): AuthorizationResult
  canManageWorkflow(user: User, workflowId: string): AuthorizationResult
  getAssignedWorkSteps(userId: string): Promise<DomainWorkStep[]>
}

