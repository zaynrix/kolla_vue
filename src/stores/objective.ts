/**
 * Objective Store - Model Layer
 * Centralized reactive state management for objectives/tasks
 * Contains domain models and priority calculation logic
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Objective } from '@/types/domain'
import { Priority } from '@/types/domain'

export const useObjectiveStore = defineStore('objective', () => {
  // State
  const objectives = ref<Objective[]>([])
  const currentObjectiveId = ref<string | null>(null)

  // Getters
  const currentObjective = computed(() => {
    if (!currentObjectiveId.value) return null
    return (
      objectives.value.find((obj) => obj.id === currentObjectiveId.value) ||
      null
    )
  })

  const objectiveCount = computed(() => objectives.value.length)

  /**
   * Get objectives prioritized by urgency
   * Immediate: ≤8h, Medium-term: ≤32h, Long-term: >32h
   */
  const prioritizedObjectives = computed(() => {
    const now = new Date()
    return [...objectives.value].sort((a, b) => {
      const aDeadline = new Date(a.deadline)
      const bDeadline = new Date(b.deadline)
      const aHoursUntilDeadline =
        (aDeadline.getTime() - now.getTime()) / (1000 * 60 * 60)
      const bHoursUntilDeadline =
        (bDeadline.getTime() - now.getTime()) / (1000 * 60 * 60)

      // Calculate priority
      const getPriorityValue = (hours: number): number => {
        if (hours <= 8) return 0 // IMMEDIATE
        if (hours <= 32) return 1 // MEDIUM_TERM
        return 2 // LONG_TERM
      }

      const aPriority = getPriorityValue(aHoursUntilDeadline)
      const bPriority = getPriorityValue(bHoursUntilDeadline)

      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }

      // If same priority, sort by deadline
      return aDeadline.getTime() - bDeadline.getTime()
    })
  })

  /**
   * Get objectives by priority
   */
  const objectivesByPriority = computed(() => {
    return {
      [Priority.IMMEDIATE]: objectives.value.filter(
        (obj) => obj.priority === Priority.IMMEDIATE
      ),
      [Priority.MEDIUM_TERM]: objectives.value.filter(
        (obj) => obj.priority === Priority.MEDIUM_TERM
      ),
      [Priority.LONG_TERM]: objectives.value.filter(
        (obj) => obj.priority === Priority.LONG_TERM
      ),
    }
  })

  // Actions
  function setObjectives(newObjectives: Objective[]) {
    objectives.value = newObjectives
  }

  function setObjective(objective: Objective) {
    const index = objectives.value.findIndex((obj) => obj.id === objective.id)
    if (index >= 0) {
      objectives.value[index] = objective
    } else {
      objectives.value.push(objective)
    }
  }

  function addObjective(objective: Objective) {
    objectives.value.push(objective)
  }

  function updateObjective(objective: Objective) {
    const index = objectives.value.findIndex((obj) => obj.id === objective.id)
    if (index >= 0) {
      objectives.value[index] = objective
    }
  }

  function removeObjective(id: string) {
    const index = objectives.value.findIndex((obj) => obj.id === id)
    if (index >= 0) {
      objectives.value.splice(index, 1)
    }
    if (currentObjectiveId.value === id) {
      currentObjectiveId.value = null
    }
  }

  function setCurrentObjective(id: string | null) {
    currentObjectiveId.value = id
  }

  function getObjectiveById(id: string): Objective | undefined {
    return objectives.value.find((obj) => obj.id === id)
  }

  function getObjectivesByWorkflow(workflowId: string): Objective[] {
    return objectives.value.filter((obj) => obj.workflowId === workflowId)
  }

  return {
    // State
    objectives,
    currentObjectiveId,

    // Getters
    currentObjective,
    objectiveCount,
    prioritizedObjectives,
    objectivesByPriority,

    // Actions
    setObjectives,
    setObjective,
    addObjective,
    updateObjective,
    removeObjective,
    setCurrentObjective,
    getObjectiveById,
    getObjectivesByWorkflow,
  }
})

