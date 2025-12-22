/**
 * useWorkStep Composable
 * ViewModel layer - Business logic for work step management
 * Handles sequential workflow assignment and completion
 */

import { ref, computed, type Ref } from 'vue'
import { useWorkStepStore } from '@/stores/workStep'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { useApi } from './useApi'
import { usePriority } from './usePriority'
import type { WorkStep, Priority, TaskStatus } from '@/types/domain'
import type { UpdateWorkStepRequest, CreateWorkStepRequest } from '@/types/api'
import { Priority as PriorityEnum, TaskStatus as TaskStatusEnum } from '@/types/domain'

export function useWorkStep() {
  const workStepStore = useWorkStepStore()
  const notificationStore = useNotificationStore()
  const userStore = useUserStore()
  const api = useApi()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Load all work steps from API
   */
  const loadWorkSteps = async () => {
    loading.value = true
    error.value = null
    try {
      const workSteps = await api.workStep.getAllWorkSteps()
      workStepStore.setWorkSteps(workSteps)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load work steps')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new work step
   */
  const createWorkStep = async (request: CreateWorkStepRequest): Promise<WorkStep> => {
    loading.value = true
    error.value = null
    try {
      const workStep = await api.workStep.createWorkStep(request)
      // Add to store - Vue reactivity will update UI automatically
      workStepStore.addWorkStep(workStep)
      return workStep
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to create work step')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Load work steps assigned to current user
   */
  const loadMyWorkSteps = async () => {
    if (!userStore.currentUser) return

    loading.value = true
    error.value = null
    try {
      const workSteps = await api.workStep.getAssignedWorkSteps(
        userStore.currentUser.id
      )
      workStepStore.setWorkSteps(workSteps)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load work steps')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Complete a work step and automatically assign next step
   * Implements sequential workflow logic
   * Updates store directly for real-time UI updates
   */
  const completeWorkStep = async (workStepId: string) => {
    loading.value = true
    error.value = null
    try {
      // Mark work step as completed
      const completedStep = await api.workStep.updateWorkStep(workStepId, {
        status: TaskStatusEnum.COMPLETED,
        completedAt: new Date().toISOString(),
      })

      // Update store with completed step - Vue reactivity will update UI automatically
      workStepStore.updateWorkStep(completedStep)

      // Get workflow to find next step
      const workflow = workStepStore.getWorkflowForStep(workStepId)
      if (!workflow) {
        throw new Error('Workflow not found for work step')
      }

      // Find next sequential work step
      const nextStep = findNextWorkStep(workflow.id, completedStep.sequenceNumber)

      if (nextStep) {
        // Automatically assign next step to next available actor with required role
        const assignedStep = await assignNextWorkStep(nextStep.id, nextStep.requiredRole)
        
        // Store is already updated by assignNextWorkStep, UI updates automatically
        // No need to reload - Vue reactivity handles it

        // Notify workflow manager about progress
        await notifyWorkflowManager(workflow.id, completedStep, assignedStep || nextStep)
      } else {
        // Workflow completed
        await notifyWorkflowCompletion(workflow.id)
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to complete work step')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Find next work step in sequence
   */
  function findNextWorkStep(
    workflowId: string,
    currentSequenceNumber: number
  ): WorkStep | null {
    const workflowSteps = workStepStore.getWorkStepsByWorkflow(workflowId)
    const nextSequence = currentSequenceNumber + 1
    return (
      workflowSteps.find((step) => step.sequenceNumber === nextSequence) || null
    )
  }

  /**
   * Automatically assign next work step to available actor with required role
   * Returns the assigned work step for further processing
   */
  async function assignNextWorkStep(
    workStepId: string,
    requiredRole: string
  ): Promise<WorkStep | null> {
    try {
      // Find available users with required role
      // This would typically query backend for available actors
      // For prototype, simulate assignment
      const availableActors = await api.workStep.getAvailableActors(requiredRole)

      if (availableActors.length > 0 && availableActors[0]) {
        // Assign to first available actor (could implement load balancing)
        const assigneeId = availableActors[0].id
        const assignedStep = await api.workStep.assignWorkStep(workStepId, assigneeId)

        // Update work step in store - Vue reactivity will update UI automatically
        workStepStore.updateWorkStep(assignedStep)

        // Notify assigned actor(s)
        const assignedUserIds = Array.isArray(assignedStep.assignedTo) 
          ? assignedStep.assignedTo 
          : assignedStep.assignedTo 
            ? [assignedStep.assignedTo] 
            : []
        
        assignedUserIds.forEach((userId) => {
          notificationStore.addNotification({
            id: `notification-${Date.now()}-${userId}`,
            userId,
            title: 'New Work Step Assigned',
            message: `You have been assigned a new work step`,
            type: 'INFO',
            read: false,
            createdAt: new Date(),
            relatedEntityId: workStepId,
            relatedEntityType: 'WORKSTEP',
            workStepId,
          })
        })
        
        return assignedStep
      }
      return null
    } catch (err) {
      // For prototype, if API call fails, log error but continue
      console.warn('Failed to assign work step automatically:', err)
      return null
    }
  }

  /**
   * Notify workflow manager about work step completion
   */
  async function notifyWorkflowManager(
    workflowId: string,
    completedStep: WorkStep,
    nextStep: WorkStep
  ): Promise<void> {
    const workflow = workStepStore.getWorkflowForStep(completedStep.id)
    if (!workflow) return

    notificationStore.addNotification({
      id: `notification-${Date.now()}`,
      userId: workflow.workflowManagerId,
      title: 'Work Step Completed',
      message: `Work step "${completedStep.title}" completed. Next step "${nextStep.title}" assigned.`,
      type: 'SUCCESS',
      read: false,
      createdAt: new Date(),
      relatedEntityId: workflowId,
      relatedEntityType: 'WORKFLOW',
      workflowId,
      workStepId: completedStep.id,
    })
  }

  /**
   * Notify workflow manager about workflow completion
   */
  async function notifyWorkflowCompletion(workflowId: string): Promise<void> {
    const workflow = workStepStore.getWorkflowForStep(workflowId)
    if (!workflow) return

    notificationStore.addNotification({
      id: `notification-${Date.now()}`,
      userId: workflow.workflowManagerId,
      title: 'Workflow Completed',
      message: `Workflow "${workflow.name}" has been completed.`,
      type: 'SUCCESS',
      read: false,
      createdAt: new Date(),
      relatedEntityId: workflowId,
      relatedEntityType: 'WORKFLOW',
      workflowId,
    })
  }

  /**
   * Update work step (e.g., change status, priority)
   * Updates store directly for real-time UI updates via Vue reactivity
   */
  const updateWorkStep = async (
    id: string,
    request: UpdateWorkStepRequest
  ): Promise<WorkStep> => {
    loading.value = true
    error.value = null
    try {
      const workStep = await api.workStep.updateWorkStep(id, request)
      
      // Update store - Vue reactivity will automatically update UI
      // No need to reload - the board will update in real-time
      workStepStore.updateWorkStep(workStep)

      // Notify workflow manager if priority changed
      if (request.manualPriority) {
        const workflow = workStepStore.getWorkflowForStep(id)
        if (workflow) {
          notificationStore.addNotification({
            id: `notification-${Date.now()}`,
            userId: workflow.workflowManagerId,
            title: 'Work Step Priority Changed',
            message: `Priority for "${workStep.title}" has been updated.`,
            type: 'INFO',
            read: false,
            createdAt: new Date(),
            relatedEntityId: workflow.id,
            relatedEntityType: 'WORKFLOW',
            workflowId: workflow.id,
            workStepId: id,
          })
        }
      }

      return workStep
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update work step')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get prioritized work steps (for actor's view)
   */
  const prioritizedWorkSteps = computed(() => {
    return workStepStore.prioritizedWorkSteps
  })

  /**
   * Get work steps assigned to current user
   */
  const myWorkSteps = computed(() => {
    if (!userStore.currentUser) return []
    return workStepStore.getAssignedWorkSteps(userStore.currentUser.id)
  })

  /**
   * Delete a work step
   */
  const deleteWorkStep = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.workStep.deleteWorkStep(id)
      // Remove from store - Vue reactivity will update UI automatically
      workStepStore.removeWorkStep(id)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to delete work step')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    workSteps: computed(() => workStepStore.workSteps),
    currentWorkStep: computed(() => workStepStore.currentWorkStep),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Actions
    loadWorkSteps,
    loadMyWorkSteps,
    createWorkStep,
    completeWorkStep,
    updateWorkStep,
    deleteWorkStep,

    // Computed
    prioritizedWorkSteps,
    myWorkSteps,
  }
}

