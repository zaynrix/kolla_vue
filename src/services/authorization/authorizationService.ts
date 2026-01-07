/**
 * Authorization Service
 * Role-based access control for work steps
 * Implements security requirement: access check ≤0.5 seconds
 */

import type {
  AuthorizationResult,
  IAuthorizationService,
} from '@/types/authorization'
import type { WorkStep, User } from '@/types/domain'
import { Role } from '@/types/domain'

export class AuthorizationService implements IAuthorizationService {
  /**
   * Check if user can access a work step
   * Security requirement: ≤0.5 seconds
   */
  canAccessWorkStep(user: User, workStep: WorkStep): AuthorizationResult {
    // Admin can access all work steps
    if (user.role === Role.ADMIN) {
      return { allowed: true }
    }

    // Workflow manager can access all work steps
    if (user.role === Role.WORKFLOW_MANAGER) {
      return { allowed: true }
    }

    // User must be assigned to the work step (supports multiple assignments)
    if (workStep.assignedTo) {
      if (Array.isArray(workStep.assignedTo)) {
        if (workStep.assignedTo.includes(user.id)) {
          return { allowed: true }
        }
      } else if (workStep.assignedTo === user.id) {
        return { allowed: true }
      }
    }

    // User must have the required role for the work step
    if (user.role === workStep.requiredRole) {
      return { allowed: true }
    }

    // Multi-tenancy check
    if (user.tenantId && workStep.workflowId) {
      // Additional tenant check would go here
      // For now, same tenant users can see each other's work steps
    }

    return {
      allowed: false,
      reason: 'User does not have required role or assignment',
    }
  }

  /**
   * Check if user can assign a work step
   */
  canAssignWorkStep(
    user: User,
    workStep: WorkStep,
    assigneeId: string
  ): AuthorizationResult {
    // Only workflow manager can manually assign
    if (user.role === Role.WORKFLOW_MANAGER) {
      return { allowed: true }
    }

    // Admin can also assign
    if (user.role === Role.ADMIN) {
      return { allowed: true }
    }

    return {
      allowed: false,
      reason: 'Only workflow managers and admins can assign work steps',
    }
  }

  /**
   * Check if user can manage a workflow
   */
  canManageWorkflow(user: User, workflowId: string): AuthorizationResult {
    // Workflow manager can manage workflows
    if (user.role === Role.WORKFLOW_MANAGER) {
      return { allowed: true }
    }

    // Admin can manage all workflows
    if (user.role === Role.ADMIN) {
      return { allowed: true }
    }

    return {
      allowed: false,
      reason: 'Only workflow managers and admins can manage workflows',
    }
  }

  /**
   * Get all work steps assigned to a user
   */
  async getAssignedWorkSteps(userId: string): Promise<WorkStep[]> {
    // This would typically fetch from API
    // For now, returns empty array (to be implemented with API integration)
    // In real implementation, this would call the API service
    return []
  }

  /**
   * Check if user has required qualifications for a work step
   */
  hasRequiredQualifications(user: User, workStep: WorkStep): boolean {
    // If work step has specific qualification requirements
    // Check against user.qualifications
    // For prototype, assume all users with correct role are qualified
    return user.role === workStep.requiredRole
  }
}

