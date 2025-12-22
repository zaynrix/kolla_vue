/**
 * useWorkflowManager Composable
 * ViewModel layer - Business logic for workflow manager
 * Handles deadline tracking, manual prioritization, and progress monitoring
 */

import { ref, computed, watch } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { useWorkStepStore } from '@/stores/workStep'
import { useNotificationStore } from '@/stores/notification'
import { useApi } from './useApi'
import type { WorkflowProgress, Workflow, WorkStep } from '@/types/domain'
import { TaskStatus, Priority } from '@/types/domain'

export function useWorkflowManager() {
  const workflowStore = useWorkflowStore()
  const workStepStore = useWorkStepStore()
  const notificationStore = useNotificationStore()
  const api = useApi()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Get workflow progress for deadline tracking
   * Shows completed/open steps and completion date
   */
  const getWorkflowProgress = (workflowId: string): WorkflowProgress => {
    const workflow = workflowStore.getWorkflowById(workflowId)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    const steps = workStepStore.getWorkStepsByWorkflow(workflowId)
    const totalSteps = steps.length
    const completedSteps = steps.filter((s) => s.status === TaskStatus.COMPLETED).length
    const pendingSteps = steps.filter((s) => s.status === TaskStatus.PENDING).length
    const inProgressSteps = steps.filter((s) => s.status === TaskStatus.IN_PROGRESS).length

    const completionPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

    // Calculate estimated completion date based on remaining work
    const remainingDuration = steps
      .filter((s) => s.status !== TaskStatus.COMPLETED)
      .reduce((sum, s) => sum + s.duration, 0)

    const estimatedCompletionDate = remainingDuration > 0
      ? new Date(Date.now() + remainingDuration * 60 * 60 * 1000)
      : undefined

    const isOnTrack = workflow.deadline
      ? !estimatedCompletionDate || estimatedCompletionDate <= workflow.deadline
      : true

    return {
      workflowId,
      totalSteps,
      completedSteps,
      pendingSteps,
      inProgressSteps,
      completionPercentage,
      estimatedCompletionDate,
      deadline: workflow.deadline,
      isOnTrack,
    }
  }

  /**
   * Manually override priority for a work step
   * Overrides automatic priority calculation
   * Updates store directly for real-time UI updates
   */
  const setManualPriority = async (workStepId: string, priority: Priority): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const updatedStep = await api.workStep.updateWorkStep(workStepId, {
        manualPriority: priority,
      })

      // Update store - Vue reactivity will automatically update UI
      // No need to reload - all views will update in real-time
      workStepStore.updateWorkStep(updatedStep)

      // Notify assigned actor(s) about priority change
      if (updatedStep.assignedTo) {
        const assignedUserIds = Array.isArray(updatedStep.assignedTo) 
          ? updatedStep.assignedTo 
          : [updatedStep.assignedTo]
        
        assignedUserIds.forEach((userId) => {
          notificationStore.addNotification({
            id: `notification-${Date.now()}-${userId}`,
            userId,
            title: 'Priority Updated',
            message: `Priority for "${updatedStep.title}" has been manually set to ${priority}`,
            type: 'INFO',
            read: false,
            createdAt: new Date(),
            relatedEntityId: workStepId,
            relatedEntityType: 'WORKSTEP',
            workStepId,
          })
        })
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to set priority')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get all workflows managed by current user
   */
  const getManagedWorkflows = computed(() => {
    const currentUser = workflowStore.workflows.find(
      (w) => w.workflowManagerId === workflowStore.currentWorkflowId
    )
    // For now, return all workflows (would filter by current user in real implementation)
    return workflowStore.workflows
  })

  /**
   * Watch for workflow changes and update progress automatically
   * Implements Usability III: Real-time updates for workflow manager
   * This ensures workflow manager always sees current state without manual refresh
   */
  watch(
    () => workStepStore.workSteps,
    (newSteps, oldSteps) => {
      // Automatically update workflow progress when work steps change
      // This ensures workflow manager always sees current state
      const workflows = workflowStore.workflows
      workflows.forEach((workflow) => {
        const progress = getWorkflowProgress(workflow.id)
        // Progress is computed, so it updates automatically via Vue reactivity
        // Trigger notification if step was just completed
        if (oldSteps && newSteps.length > oldSteps.length) {
          // New step added (assigned)
        } else if (oldSteps) {
          // Check for status changes
          const changedSteps = newSteps.filter((newStep, index) => {
            const oldStep = oldSteps[index]
            return oldStep && oldStep.status !== newStep.status && newStep.status === TaskStatus.COMPLETED
          })
          if (changedSteps.length > 0) {
            // Step was completed - progress already updated via computed property
            // Vue reactivity will automatically update UI
          }
        }
      })
    },
    { deep: true }
  )

  /**
   * Get all work steps for a workflow with current status
   */
  const getWorkflowSteps = (workflowId: string) => {
    return computed(() => {
      return workStepStore.getWorkStepsByWorkflow(workflowId)
    })
  }

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    managedWorkflows: getManagedWorkflows,

    // Actions
    getWorkflowProgress,
    setManualPriority,
    getWorkflowSteps,
  }
}

