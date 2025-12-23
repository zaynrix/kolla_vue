/**
 * useWorkflow Composable
 * ViewModel layer - Business logic for workflow management
 * Handles workflow operations, filtering, and event handling
 */

import { ref, computed, watch, type Ref } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { useApi } from './useApi'
import type { Workflow, Objective } from '@/types/domain'
import type { CreateWorkflowRequest } from '@/types/api'

export function useWorkflow() {
  const workflowStore = useWorkflowStore()
  const api = useApi()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Load all workflows from API
   */
  const loadWorkflows = async () => {
    loading.value = true
    error.value = null
    try {
      const workflows = await api.workflow.getAllWorkflows()
      workflowStore.setWorkflows(workflows)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load workflows')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Load a specific workflow by ID
   */
  const loadWorkflow = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const workflow = await api.workflow.getWorkflowById(id)
      workflowStore.setWorkflow(workflow)
      return workflow
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load workflow')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new workflow
   */
  const createWorkflow = async (request: CreateWorkflowRequest) => {
    loading.value = true
    error.value = null
    try {
      const workflow = await api.workflow.createWorkflow(request)
      workflowStore.addWorkflow(workflow)
      return workflow
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to create workflow')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing workflow
   */
  const updateWorkflow = async (
    id: string,
    request: Partial<CreateWorkflowRequest>
  ) => {
    loading.value = true
    error.value = null
    try {
      const workflow = await api.workflow.updateWorkflow(id, request)
      workflowStore.updateWorkflow(workflow)
      return workflow
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update workflow')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a workflow
   */
  const deleteWorkflow = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await api.workflow.deleteWorkflow(id)
      workflowStore.removeWorkflow(id)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to delete workflow')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Filter workflows by name (reactive)
   */
  const filterWorkflowsByName = (searchTerm: Ref<string>) => {
    return computed(() => {
      if (!searchTerm.value.trim()) {
        return workflowStore.workflows
      }
      const term = searchTerm.value.toLowerCase()
      return workflowStore.workflows.filter((w) =>
        w.name.toLowerCase().includes(term)
      )
    })
  }

  /**
   * Get workflows sorted by creation date
   */
  const sortedWorkflows = computed(() => {
    return [...workflowStore.workflows].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  return {
    // State
    workflows: computed(() => workflowStore.workflows),
    currentWorkflow: computed(() => workflowStore.currentWorkflow),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Actions
    loadWorkflows,
    loadWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,

    // Computed helpers
    filterWorkflowsByName,
    sortedWorkflows,
  }
}




