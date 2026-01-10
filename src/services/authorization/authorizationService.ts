import type {
  AuthorizationResult,
  IAuthorizationService,
} from '@/types/authorization'
import type { WorkStep, User } from '@/types/domain'
import { Role } from '@/types/domain'

export class AuthorizationService implements IAuthorizationService {
  canAccessWorkStep(user: User, workStep: WorkStep): AuthorizationResult {
    if (user.role === Role.ADMIN) {
      return { allowed: true }
    }

    if (user.role === Role.WORKFLOW_MANAGER) {
      return { allowed: true }
    }
    if (workStep.assignedTo) {
      if (Array.isArray(workStep.assignedTo)) {
        if (workStep.assignedTo.includes(user.id)) {
          return { allowed: true }
        }
      } else if (workStep.assignedTo === user.id) {
        return { allowed: true }
      }
    }

    if (user.role === workStep.requiredRole) {
      return { allowed: true }
    }

    if (user.tenantId && workStep.workflowId) {
    }

    return {
      allowed: false,
      reason: 'User does not have required role or assignment',
    }
  }

  canAssignWorkStep(
    user: User,
    workStep: WorkStep,
    assigneeId: string
  ): AuthorizationResult {
    if (user.role === Role.WORKFLOW_MANAGER) {
      return { allowed: true }
    }

    if (user.role === Role.ADMIN) {
      return { allowed: true }
    }

    return {
      allowed: false,
      reason: 'Only workflow managers and admins can assign work steps',
    }
  }

  canManageWorkflow(user: User, workflowId: string): AuthorizationResult {
    if (user.role === Role.WORKFLOW_MANAGER) {
      return { allowed: true }
    }

    if (user.role === Role.ADMIN) {
      return { allowed: true }
    }

    return {
      allowed: false,
      reason: 'Only workflow managers and admins can manage workflows',
    }
  }

  async getAssignedWorkSteps(userId: string): Promise<WorkStep[]> {
    return []
  }

  hasRequiredQualifications(user: User, workStep: WorkStep): boolean {
    return user.role === workStep.requiredRole
  }
}

