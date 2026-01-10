import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WorkStep, Priority, Workflow } from '@/types/domain'
import { Priority as PriorityEnum, TaskStatus } from '@/types/domain'
import { useWorkflowStore } from './workflow'

export const useWorkStepStore = defineStore('workStep', () => {
  const workSteps = ref<WorkStep[]>([])
  const currentWorkStepId = ref<string | null>(null)

  const workflowStore = useWorkflowStore()

  const currentWorkStep = computed(() => {
    if (!currentWorkStepId.value) return null
    return (
      workSteps.value.find((step) => step.id === currentWorkStepId.value) ||
      null
    )
  })

  const prioritizedWorkSteps = computed(() => {
    const now = new Date()
    return [...workSteps.value].sort((a, b) => {
      const aPriority = a.manualPriority || calculatePriority(a, now)
      const bPriority = b.manualPriority || calculatePriority(b, now)

      const priorityOrder = {
        [PriorityEnum.SHORT_TERM]: 0,
        [PriorityEnum.MID_TERM]: 1,
        [PriorityEnum.LONG_TERM]: 2,
      }

      const aPriorityValue = priorityOrder[aPriority] ?? 2
      const bPriorityValue = priorityOrder[bPriority] ?? 2

      if (aPriorityValue !== bPriorityValue) {
        return aPriorityValue - bPriorityValue
      }

      return a.sequenceNumber - b.sequenceNumber
    })
  })

  function calculatePriority(workStep: WorkStep, now: Date): Priority {
    const workflow = workflowStore.getWorkflowById(workStep.workflowId)
    if (!workflow || !workflow.deadline) {
      return PriorityEnum.LONG_TERM
    }

    const deadline = new Date(workflow.deadline)
    const hoursUntilDeadline =
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Calculate duration of ALL remaining open tasks in the workflow
    const totalRemainingDuration = getTotalRemainingDuration(workflow.id)
    const effectiveHoursUntilDeadline = hoursUntilDeadline - totalRemainingDuration

    // Urgency thresholds:
    // - "sofort" (immediate) if remaining duration ≤ 8 hours
    // - "mittelfristig" (medium-term) if remaining duration > 8 and ≤ 32 hours
    // - "langfristig" (long-term) otherwise
    if (effectiveHoursUntilDeadline <= 8) {
      return PriorityEnum.SHORT_TERM // "sofort"
    } else if (effectiveHoursUntilDeadline <= 32) {
      return PriorityEnum.MID_TERM // "mittelfristig"
    } else {
      return PriorityEnum.LONG_TERM // "langfristig"
    }
  }

  /**
   * Get total duration of all remaining open tasks in a workflow
   * This includes ALL open tasks, not just from a specific sequence
   */
  function getTotalRemainingDuration(workflowId: string): number {
    const workflowSteps = getWorkStepsByWorkflow(workflowId)
    return workflowSteps
      .filter((step) => step.status !== TaskStatus.COMPLETED)
      .reduce((sum, step) => sum + step.duration, 0)
  }

  /**
   * Get work steps by workflow ID
   */
  function getWorkStepsByWorkflow(workflowId: string): WorkStep[] {
    return workSteps.value.filter((step) => step.workflowId === workflowId)
  }

  /**
   * Get workflow for a work step
   */
  function getWorkflowForStep(workStepId: string): Workflow | undefined {
    const workStep = workSteps.value.find((step) => step.id === workStepId)
    if (!workStep) return undefined
    return workflowStore.getWorkflowById(workStep.workflowId)
  }

  /**
   * Get work steps assigned to a user (supports both single and multiple assignments)
   */
  function getAssignedWorkSteps(userId: string): WorkStep[] {
    return workSteps.value.filter((step) => {
      if (!step.assignedTo) return false
      if (Array.isArray(step.assignedTo)) {
        return step.assignedTo.includes(userId)
      }
      return step.assignedTo === userId
    })
  }

  function setWorkSteps(newWorkSteps: WorkStep[]) {
    workSteps.value = newWorkSteps
  }

  function setWorkStep(workStep: WorkStep) {
    const index = workSteps.value.findIndex((step) => step.id === workStep.id)
    if (index >= 0) {
      workSteps.value[index] = workStep
    } else {
      workSteps.value.push(workStep)
    }
  }

  function addWorkStep(workStep: WorkStep) {
    workSteps.value.push(workStep)
  }

  /**
   * Update a work step in the store
   * This automatically triggers reactivity updates in all views that use workSteps
   * Real-time updates: When a workflow manager updates a work step, all actors
   * with their work step lists open will see the changes automatically
   * 
   * Note: For cross-browser/tab updates, SignalR broadcasts the change and
   * other tabs receive it via handleAssignmentUpdated in signalrService
   */
  function updateWorkStep(workStep: WorkStep) {
    const index = workSteps.value.findIndex((step) => step.id === workStep.id)
    if (index >= 0) {
      // Use splice to ensure Vue reactivity detects the change
      // Direct index assignment sometimes doesn't trigger reactivity properly
      workSteps.value.splice(index, 1, { ...workStep })
    } else {
      workSteps.value.push(workStep)
    }
  }

  function removeWorkStep(id: string) {
    const index = workSteps.value.findIndex((step) => step.id === id)
    if (index >= 0) {
      workSteps.value.splice(index, 1)
    }
    if (currentWorkStepId.value === id) {
      currentWorkStepId.value = null
    }
  }

  function setCurrentWorkStep(id: string | null) {
    currentWorkStepId.value = id
  }

  function getWorkStepById(id: string): WorkStep | undefined {
    return workSteps.value.find((step) => step.id === id)
  }

  return {
    workSteps,
    currentWorkStepId,
    currentWorkStep,
    prioritizedWorkSteps,
    setWorkSteps,
    setWorkStep,
    addWorkStep,
    updateWorkStep,
    removeWorkStep,
    setCurrentWorkStep,
    getWorkStepById,
    getWorkStepsByWorkflow,
    getWorkflowForStep,
    getAssignedWorkSteps,
    calculatePriority,
  }
})

