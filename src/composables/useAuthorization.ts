/**
 * useAuthorization Composable
 * ViewModel layer - Authorization and access control
 * Implements security requirement: access check ≤0.5 seconds
 */

import { computed } from 'vue'
import { AuthorizationService } from '@/services/authorization/authorizationService'
import { useUserStore } from '@/stores/user'
import type { AuthorizationResult } from '@/types/authorization'
import type { WorkStep as DomainWorkStep } from '@/types/domain'

const authorizationService = new AuthorizationService()

export function useAuthorization() {
  const userStore = useUserStore()

  /**
   * Check if current user can access a work step
   * Security requirement: ≤0.5 seconds
   */
  const canAccessWorkStep = (
    workStep: DomainWorkStep
  ): AuthorizationResult => {
    if (!userStore.currentUser) {
      return { allowed: false, reason: 'User not authenticated' }
    }

    return authorizationService.canAccessWorkStep(
      userStore.currentUser,
      workStep
    )
  }

  /**
   * Check if current user can assign a work step
   */
  const canAssignWorkStep = (
    workStep: DomainWorkStep,
    assigneeId: string
  ): AuthorizationResult => {
    if (!userStore.currentUser) {
      return { allowed: false, reason: 'User not authenticated' }
    }

    return authorizationService.canAssignWorkStep(
      userStore.currentUser,
      workStep,
      assigneeId
    )
  }

  /**
   * Check if current user can manage a workflow
   */
  const canManageWorkflow = (workflowId: string): AuthorizationResult => {
    if (!userStore.currentUser) {
      return { allowed: false, reason: 'User not authenticated' }
    }

    return authorizationService.canManageWorkflow(
      userStore.currentUser,
      workflowId
    )
  }

  /**
   * Get filtered work steps that current user can access
   */
  const getAccessibleWorkSteps = (
    workSteps: DomainWorkStep[]
  ): DomainWorkStep[] => {
    if (!userStore.currentUser) return []

    return workSteps.filter((step) => {
      const result = canAccessWorkStep(step)
      return result.allowed
    })
  }

  /**
   * Check if user is workflow manager
   */
  const isWorkflowManager = computed(() => {
    return userStore.isWorkflowManager
  })

  /**
   * Check if user is admin
   */
  const isAdmin = computed(() => {
    return userStore.isAdmin
  })

  return {
    canAccessWorkStep,
    canAssignWorkStep,
    canManageWorkflow,
    getAccessibleWorkSteps,
    isWorkflowManager,
    isAdmin,
  }
}

