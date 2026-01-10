import { ref, computed } from 'vue'
import { useApi } from './useApi'
import { mapActorToUser } from '@/services/api/mappers'
import type { ActorDto, AssignmentDto, CreateActorRequest } from '@/types/api'
import type { User } from '@/types/domain'

export function useActor() {
  const api = useApi()
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const actors = ref<ActorDto[]>([])

  const loadActors = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const actorGuids = await api.actor.getAllActors()
      const loadedActors = await Promise.all(
        actorGuids.map((guid: string) => api.actor.getActor(guid))
      )
      actors.value = loadedActors
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load actors')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get a specific actor by GUID
   */
  const getActor = async (guid: string): Promise<ActorDto> => {
    loading.value = true
    error.value = null
    try {
      const actor = await api.actor.getActor(guid)
      return actor
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load actor')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get actor as User (mapped from ActorDto)
   */
  const getActorAsUser = async (guid: string): Promise<User> => {
    const actor = await getActor(guid)
    return mapActorToUser(actor, actor.role || undefined)
  }

  /**
   * Create a new actor
   */
  const createActor = async (request: CreateActorRequest): Promise<string> => {
    loading.value = true
    error.value = null
    try {
      if (!request.DisplayName || request.DisplayName.trim() === '') {
        throw new Error('Display Name is required')
      }
      const actorGuid = await api.actor.createActor(request)
      await loadActors() // Reload actors list
      return actorGuid
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create actor'
      error.value = new Error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update actor display name
   */
  const updateActorDisplayName = async (actorGuid: string, displayName: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.actor.setActorDisplayName(actorGuid, displayName)
      await loadActors() // Reload actors list
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update actor')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update actor role
   */
  const updateActorRole = async (actorGuid: string, roleGuid?: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.actor.setActorRole(actorGuid, roleGuid)
      await loadActors() // Reload actors list
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update actor')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get assignments for an actor
   */
  const getActorAssignments = async (actorGuid: string): Promise<string[]> => {
    loading.value = true
    error.value = null
    try {
      const assignmentGuids = await api.actor.getAllAssignments(actorGuid)
      return assignmentGuids
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load assignments')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete an actor
   */
  const deleteActor = async (guid: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      if (!guid) {
        throw new Error('Actor GUID is required')
      }
      await api.actor.deleteActor(guid)
      await loadActors() // Reload actors list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete actor'
      error.value = new Error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    actors: computed(() => actors.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Actions
    loadActors,
    getActor,
    getActorAsUser,
    createActor,
    updateActorDisplayName,
    updateActorRole,
    getActorAssignments,
    deleteActor,
  }
}

