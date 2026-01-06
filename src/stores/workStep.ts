/**
 * WorkStep Store - Model Layer
 * Centralized reactive state management for work steps
 * Handles sequential workflow logic and priority calculation
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WorkStep, Priority, Workflow } from '@/types/domain'
import { Priority as PriorityEnum, TaskStatus } from '@/types/domain'
import { useWorkflowStore } from './workflow'

export const useWorkStepStore = defineStore('workStep', () => {
  // State
  const workSteps = ref<WorkStep[]>([])
  const currentWorkStepId = ref<string | null>(null)

  const workflowStore = useWorkflowStore()

  // Getters
  const currentWorkStep = computed(() => {
    if (!currentWorkStepId.value) return null
    return (
      workSteps.value.find((step) => step.id === currentWorkStepId.value) ||
      null
    )
  })

  /**
   * Get work steps prioritized by urgency
   * Immediate: ≤8h, Medium-term: ≤32h, Long-term: >32h
   * Manual priority override takes precedence
   */
  const prioritizedWorkSteps = computed(() => {
    const now = new Date()
    return [...workSteps.value].sort((a, b) => {
      // Use manual priority if set, otherwise calculate
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

      // If same priority, sort by sequence number (for sequential workflow)
      return a.sequenceNumber - b.sequenceNumber
    })
  })

  /**
   * Calculate priority based on workflow deadline and remaining duration
   * According to requirements: Priority is based on remaining duration of ALL remaining work steps
   * - ≤8h → IMMEDIATE
   * - >8h & ≤32h → MEDIUM_TERM
   * - >32h → LONG_TERM
   */
  function calculatePriority(workStep: WorkStep, now: Date): Priority {
    const workflow = workflowStore.getWorkflowById(workStep.workflowId)
    if (!workflow || !workflow.deadline) {
      return PriorityEnum.LONG_TERM
    }

    const deadline = new Date(workflow.deadline)
    const hoursUntilDeadline =
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Calculate total duration of ALL remaining work steps (including current and all subsequent)
    const totalRemainingDuration = getTotalRemainingDuration(workflow.id, workStep.sequenceNumber)
    
    // Effective hours = deadline - remaining work duration
    const effectiveHoursUntilDeadline = hoursUntilDeadline - totalRemainingDuration

    if (effectiveHoursUntilDeadline <= 8) {
      return PriorityEnum.SHORT_TERM // ShortTerm
    } else if (effectiveHoursUntilDeadline <= 32) {
      return PriorityEnum.MID_TERM // MidTerm
    } else {
      return PriorityEnum.LONG_TERM // LongTerm
    }
  }

  /**
   * Get total duration of ALL remaining work steps
   * Includes current step and all subsequent steps that are not yet completed
   */
  function getTotalRemainingDuration(workflowId: string, currentSequence: number): number {
    const workflowSteps = getWorkStepsByWorkflow(workflowId)
    return workflowSteps
      .filter((step) => step.sequenceNumber >= currentSequence && step.status !== TaskStatus.COMPLETED)
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

  // Actions
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

  function updateWorkStep(workStep: WorkStep) {
    const index = workSteps.value.findIndex((step) => step.id === workStep.id)
    if (index >= 0) {
      // Replace the entire object to ensure Vue reactivity detects the change
      // This ensures the board updates in real-time when status changes
      workSteps.value[index] = { ...workStep }
    } else {
      // If not found, add it
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
    // State
    workSteps,
    currentWorkStepId,

    // Getters
    currentWorkStep,
    prioritizedWorkSteps,

    // Actions
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
  }
})

