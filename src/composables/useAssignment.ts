import { ref, computed } from 'vue'
import { useApi } from './useApi'
import type { AssignmentDto } from '@/types/api'
import type { CreateAssignmentParams } from '@/services/api/assignmentApi'

export function useAssignment() {
  const api = useApi()
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const assignments = ref<AssignmentDto[]>([])

  const loadAllAssignments = async (): Promise<AssignmentDto[]> => {
    loading.value = true
    error.value = null
    try {
      const assignmentGuids = await api.assignment.getAllAssignments()
      
      if (!assignmentGuids || assignmentGuids.length === 0) {
        assignments.value = []
        return []
      }

      // Fetch all assignment details
      const assignmentResults = await Promise.allSettled(
        assignmentGuids.map((guid: string) => api.assignment.getAssignment(guid))
      )

      const loadedAssignments = assignmentResults
        .filter((result): result is PromiseFulfilledResult<AssignmentDto> => result.status === 'fulfilled')
        .map(result => result.value)

      assignments.value = loadedAssignments
      return loadedAssignments
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load assignments')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get a specific assignment by GUID
   */
  const getAssignment = async (guid: string): Promise<AssignmentDto> => {
    loading.value = true
    error.value = null
    try {
      const assignment = await api.assignment.getAssignment(guid)
      return assignment
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load assignment')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new assignment with validation
   */
  const createAssignment = async (params: CreateAssignmentParams): Promise<string> => {
    loading.value = true
    error.value = null
    try {
      // Validate required fields
      if (!params.displayName || params.displayName.trim() === '') {
        throw new Error('DisplayName is required')
      }

      const guid = await api.assignment.createAssignment(params)
      await loadAllAssignments() // Reload assignments list
      return guid
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to create assignment')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update assignment display name
   */
  const updateDisplayName = async (guid: string, displayName: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      if (!displayName || displayName.trim() === '') {
        throw new Error('DisplayName is required')
      }
      await api.assignment.setAssignmentDisplayName(guid, displayName)
      await loadAllAssignments()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update display name')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update assignment description
   */
  const updateDescription = async (guid: string, description?: string | null): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.assignment.setAssignmentDescription(guid, description)
      await loadAllAssignments()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update description')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Note: Assignment API doesn't have SetStartDate or SetDeadlineDate endpoints
  // These methods have been removed as they don't exist in the backend API
  // Use updateDuration instead - dates can be used to calculate duration

  /**
   * Update assignment duration
   * Duration is in hours
   */
  const updateDuration = async (guid: string, duration: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      if (duration <= 0) {
        throw new Error('Duration must be greater than 0')
      }
      await api.assignment.setAssignmentDuration(guid, duration)
      await loadAllAssignments()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update duration')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update assignment assignee
   */
  const updateAssignee = async (guid: string, assigneeGuid?: string | null): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.assignment.setAssignmentAssignee(guid, assigneeGuid)
      await loadAllAssignments()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update assignee')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update assignment required role
   */
  const updateRequiredRole = async (guid: string, requiredRoleGuid?: string | null): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.assignment.setAssignmentRequiredRole(guid, requiredRoleGuid)
      await loadAllAssignments()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update required role')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update assignment priority
   * Priority must be 0, 1, or 2 (0=ShortTerm, 1=MidTerm, 2=LongTerm)
   */
  const updatePriority = async (guid: string, priority: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      if (priority !== 0 && priority !== 1 && priority !== 2) {
        throw new Error('Priority must be 0, 1, or 2')
      }
      await api.assignment.setAssignmentPriority(guid, priority)
      await loadAllAssignments()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update priority')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update assignment status
   * Status must be 0, 1, or 2 (0=Planned, 1=InProgress, 2=Completed)
   * Status=2 auto-calculates endDate
   */
  const updateStatus = async (guid: string, status: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      if (status !== 0 && status !== 1 && status !== 2) {
        throw new Error('Status must be 0, 1, or 2')
      }
      await api.assignment.setAssignmentStatus(guid, status)
      await loadAllAssignments()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update status')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update assignment parent objective
   */
  const updateParentObjective = async (guid: string, parentObjectiveGuid?: string | null): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.assignment.setAssignmentParentObjective(guid, parentObjectiveGuid)
      await loadAllAssignments()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update parent objective')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete an assignment
   */
  const deleteAssignment = async (guid: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.assignment.deleteAssignment(guid)
      await loadAllAssignments()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to delete assignment')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    assignments: computed(() => assignments.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Actions
    loadAllAssignments,
    getAssignment,
    createAssignment,
    updateDisplayName,
    updateDescription,
    // updateStartDate and updateDeadlineDate removed - API doesn't support these endpoints
    updateDuration,
    updateAssignee,
    updateRequiredRole,
    updatePriority,
    updateStatus,
    updateParentObjective,
    deleteAssignment,
  }
}

