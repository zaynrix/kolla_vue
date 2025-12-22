/**
 * useObjective Composable
 * ViewModel layer - Business logic for objective/task management
 * Handles objective operations, filtering, and prioritization
 */

import { ref, computed, type Ref } from 'vue'
import { useObjectiveStore } from '@/stores/objective'
import { useApi } from './useApi'
import { usePriority } from './usePriority'
import type { Objective } from '@/types/domain'
import type { CreateObjectiveRequest, UpdateObjectiveRequest } from '@/types/api'
import { Priority } from '@/types/domain'

export function useObjective() {
  const objectiveStore = useObjectiveStore()
  const api = useApi()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Load all objectives from API
   */
  const loadObjectives = async () => {
    loading.value = true
    error.value = null
    try {
      // Backend returns GUIDs, need to fetch each objective
      const objectiveGuids = await api.objective.getAllObjectives()
      const objectives = await Promise.all(
        objectiveGuids.map((guid) => api.objective.getObjective(guid))
      )
      // Map ObjectiveDto to Objective domain model
      // Note: This is a simplified mapping - in production would need proper mapping
      objectiveStore.setObjectives(objectives.map((obj) => ({
        id: obj.guid,
        title: obj.displayName,
        description: obj.description,
        deadline: new Date(),
        duration: 8,
        workflowId: '',
        assignedTo: undefined,
        status: 'PENDING' as any,
        priority: 'LONG_TERM' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      })))
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load objectives')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Load objectives for a specific workflow
   */
  const loadObjectivesByWorkflow = async (workflowId: string) => {
    loading.value = true
    error.value = null
    try {
      // Backend uses GetObjectiveAssignments for workflow objectives
      const objective = await api.objective.getObjectiveAssignments(workflowId)
      // Map to Objective domain model
      objectiveStore.setObjectives([{
        id: objective.guid,
        title: objective.displayName,
        description: objective.description,
        deadline: new Date(),
        duration: 8,
        workflowId,
        assignedTo: undefined,
        status: 'PENDING' as any,
        priority: 'LONG_TERM' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      }])
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load objectives')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new objective
   */
  const createObjective = async (request: CreateObjectiveRequest) => {
    loading.value = true
    error.value = null
    try {
      // Map CreateObjectiveRequest to CreateObjectiveDtoRequest
      const objectiveGuid = await api.objective.createObjective({
        displayName: request.title,
        description: request.description,
      })
      // Fetch created objective
      const objectiveDto = await api.objective.getObjective(objectiveGuid)
      // Map to Objective domain model
      const objective: Objective = {
        id: objectiveDto.guid,
        title: objectiveDto.displayName,
        description: objectiveDto.description,
        deadline: request.deadline ? new Date(request.deadline) : new Date(),
        duration: request.duration,
        workflowId: request.workflowId,
        assignedTo: request.assignedTo,
        status: 'PENDING' as any,
        priority: 'LONG_TERM' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      objectiveStore.addObjective(objective)
      return objective
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to create objective')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing objective
   */
  const updateObjective = async (
    id: string,
    request: UpdateObjectiveRequest
  ) => {
    loading.value = true
    error.value = null
    try {
      // Update using PATCH endpoints
      if (request.title) {
        await api.objective.setObjectiveDisplayName(id, request.title)
      }
      if (request.description !== undefined) {
        await api.objective.setObjectiveDescription(id, request.description)
      }
      // Fetch updated objective
      const objectiveDto = await api.objective.getObjective(id)
      // Map to Objective domain model
      const objective: Objective = {
        id: objectiveDto.guid,
        title: objectiveDto.displayName,
        description: objectiveDto.description,
        deadline: request.deadline ? new Date(request.deadline) : new Date(),
        duration: request.duration || 8,
        workflowId: '',
        assignedTo: request.assignedTo,
        status: request.status || 'PENDING' as any,
        priority: 'LONG_TERM' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      objectiveStore.updateObjective(objective)
      return objective
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update objective')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete an objective
   */
  const deleteObjective = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await api.objective.deleteObjective(id)
      objectiveStore.removeObjective(id)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to delete objective')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Filter objectives by priority
   */
  const filterByPriority = (priority: Priority) => {
    return computed(() => {
      return objectiveStore.objectives.filter((obj) => obj.priority === priority)
    })
  }

  /**
   * Get prioritized objectives (sorted by urgency)
   * Uses priority calculation based on deadline and duration
   */
  const prioritizedObjectives = computed(() => {
    return [...objectiveStore.objectives].sort((a, b) => {
      const priorityOrder = {
        [Priority.IMMEDIATE]: 0,
        [Priority.MEDIUM_TERM]: 1,
        [Priority.LONG_TERM]: 2,
      }

      // First sort by calculated priority
      const aPriority = priorityOrder[a.priority] ?? 2
      const bPriority = priorityOrder[b.priority] ?? 2

      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }

      // Then by deadline
      return (
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      )
    })
  })

  /**
   * Get objectives for a specific workflow
   */
  const objectivesByWorkflow = (workflowId: string) => {
    return computed(() => {
      return objectiveStore.objectives.filter(
        (obj) => obj.workflowId === workflowId
      )
    })
  }

  return {
    // State
    objectives: computed(() => objectiveStore.objectives),
    currentObjective: computed(() => objectiveStore.currentObjective),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Actions
    loadObjectives,
    loadObjectivesByWorkflow,
    createObjective,
    updateObjective,
    deleteObjective,

    // Computed helpers
    filterByPriority,
    prioritizedObjectives,
    objectivesByWorkflow,
  }
}

/**
 * useObjectivePriority - Composable for priority calculations on a specific objective
 */
export function useObjectivePriority(objectiveId: Ref<string | null>) {
  const objectiveStore = useObjectiveStore()
  const objective = computed(() => {
    if (!objectiveId.value) return null
    return (
      objectiveStore.objectives.find((obj) => obj.id === objectiveId.value) ||
      null
    )
  })

  return usePriority(objective)
}

