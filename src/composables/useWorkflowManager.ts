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

  const setManualPriority = async (workStepId: string, priority: Priority): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const updatedStep = await api.workStep.updateWorkStep(workStepId, {
        manualPriority: priority,
      })

      workStepStore.updateWorkStep(updatedStep)

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

  const getManagedWorkflows = computed(() => {
    const currentUser = workflowStore.workflows.find(
      (w) => w.workflowManagerId === workflowStore.currentWorkflowId
    )
    return workflowStore.workflows
  })

  watch(
    () => workStepStore.workSteps,
    (newSteps, oldSteps) => {
      const workflows = workflowStore.workflows
      workflows.forEach((workflow) => {
        const progress = getWorkflowProgress(workflow.id)
        if (oldSteps && newSteps.length > oldSteps.length) {
        } else if (oldSteps) {
          const changedSteps = newSteps.filter((newStep, index) => {
            const oldStep = oldSteps[index]
            return oldStep && oldStep.status !== newStep.status && newStep.status === TaskStatus.COMPLETED
          })
          if (changedSteps.length > 0) {
          }
        }
      })
    },
    { deep: true }
  )

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

