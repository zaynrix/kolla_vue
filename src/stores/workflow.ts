/**
 * Workflow Store - Model Layer
 * Centralized reactive state management for workflows
 * No UI dependencies for high testability
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Workflow } from '@/types/domain'

export const useWorkflowStore = defineStore('workflow', () => {
  // State
  const workflows = ref<Workflow[]>([])
  const currentWorkflowId = ref<string | null>(null)

  // Getters
  const currentWorkflow = computed(() => {
    if (!currentWorkflowId.value) return null
    return workflows.value.find((w) => w.id === currentWorkflowId.value) || null
  })

  const workflowCount = computed(() => workflows.value.length)

  // Actions
  function setWorkflows(newWorkflows: Workflow[]) {
    workflows.value = newWorkflows
  }

  function setWorkflow(workflow: Workflow) {
    const index = workflows.value.findIndex((w) => w.id === workflow.id)
    if (index >= 0) {
      workflows.value[index] = workflow
    } else {
      workflows.value.push(workflow)
    }
  }

  function addWorkflow(workflow: Workflow) {
    workflows.value.push(workflow)
  }

  function updateWorkflow(workflow: Workflow) {
    const index = workflows.value.findIndex((w) => w.id === workflow.id)
    if (index >= 0) {
      workflows.value[index] = workflow
    }
  }

  function removeWorkflow(id: string) {
    const index = workflows.value.findIndex((w) => w.id === id)
    if (index >= 0) {
      workflows.value.splice(index, 1)
    }
    if (currentWorkflowId.value === id) {
      currentWorkflowId.value = null
    }
  }

  function setCurrentWorkflow(id: string | null) {
    currentWorkflowId.value = id
  }

  function getWorkflowById(id: string): Workflow | undefined {
    return workflows.value.find((w) => w.id === id)
  }

  return {
    // State
    workflows,
    currentWorkflowId,

    // Getters
    currentWorkflow,
    workflowCount,

    // Actions
    setWorkflows,
    setWorkflow,
    addWorkflow,
    updateWorkflow,
    removeWorkflow,
    setCurrentWorkflow,
    getWorkflowById,
  }
})



