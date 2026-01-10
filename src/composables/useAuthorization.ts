import { computed } from 'vue'
import { AuthorizationService } from '@/services/authorization/authorizationService'
import { useUserStore } from '@/stores/user'
import type { AuthorizationResult } from '@/types/authorization'
import type { WorkStep as DomainWorkStep } from '@/types/domain'

const authorizationService = new AuthorizationService()

export function useAuthorization() {
  const userStore = useUserStore()

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

  const canManageWorkflow = (workflowId: string): AuthorizationResult => {
    if (!userStore.currentUser) {
      return { allowed: false, reason: 'User not authenticated' }
    }

    return authorizationService.canManageWorkflow(
      userStore.currentUser,
      workflowId
    )
  }

  const getAccessibleWorkSteps = (
    workSteps: DomainWorkStep[]
  ): DomainWorkStep[] => {
    if (!userStore.currentUser) return []

    return workSteps.filter((step) => {
      const result = canAccessWorkStep(step)
      return result.allowed
    })
  }

  const isWorkflowManager = computed(() => {
    return userStore.isWorkflowManager
  })

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

