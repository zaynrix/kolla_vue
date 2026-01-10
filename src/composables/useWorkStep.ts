import { ref, computed, type Ref } from 'vue'
import { useWorkStepStore } from '@/stores/workStep'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { useApi } from './useApi'
import { usePriority } from './usePriority'
import type { WorkStep, Priority, TaskStatus } from '@/types/domain'
import type { UpdateWorkStepRequest, CreateWorkStepRequest } from '@/types/api'
import { Priority as PriorityEnum, TaskStatus as TaskStatusEnum } from '@/types/domain'

export function useWorkStep() {
  const workStepStore = useWorkStepStore()
  const notificationStore = useNotificationStore()
  const userStore = useUserStore()
  const api = useApi()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const loadWorkSteps = async () => {
    loading.value = true
    error.value = null
    try {
      const workSteps = await api.workStep.getAllWorkSteps()
      workStepStore.setWorkSteps(workSteps)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load work steps')
      throw err
    } finally {
      loading.value = false
    }
  }

  const createWorkStep = async (request: CreateWorkStepRequest): Promise<WorkStep> => {
    loading.value = true
    error.value = null
    try {
      const workStep = await api.workStep.createWorkStep(request)
      workStepStore.addWorkStep(workStep)

      // Notify assigned users if work step was assigned
      if (workStep.assignedTo) {
        const assignedUserIds = Array.isArray(workStep.assignedTo)
          ? workStep.assignedTo
          : [workStep.assignedTo]
        
        assignedUserIds.forEach((userId) => {
          notificationStore.addNotification({
            id: `notification-assign-${Date.now()}-${userId}-${Math.random()}`,
            userId,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: "${workStep.title}"`,
            type: 'INFO',
            read: false,
            createdAt: new Date(),
            relatedEntityId: workStep.id,
            relatedEntityType: 'WORKSTEP',
            workflowId: workStep.workflowId,
            workStepId: workStep.id,
          })
        })
      }

      return workStep
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to create work step')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Load work steps assigned to the current user
   * Optimized for fast access to personal task list (< 0.5s target)
   * Uses dedicated API endpoint for assigned work steps (more efficient than loading all)
   */
  const loadMyWorkSteps = async () => {
    if (!userStore.currentUser) return

    const loadStartTime = performance.now()
    loading.value = true
    error.value = null
    try {
      // Use dedicated endpoint for assigned work steps - faster than loading all
      const workSteps = await api.workStep.getAssignedWorkSteps(
        userStore.currentUser.id
      )
      workStepStore.setWorkSteps(workSteps)
      
      const loadEndTime = performance.now()
      const loadDuration = loadEndTime - loadStartTime
      console.log(`[useWorkStep] Personal task list loaded in ${loadDuration.toFixed(2)}ms`)
      
      // Log warning if loading takes too long
      if (loadDuration > 500) {
        console.warn(`[useWorkStep] Personal task list loading exceeded 500ms target: ${loadDuration.toFixed(2)}ms`)
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load work steps')
      throw err
    } finally {
      loading.value = false
    }
  }

  const completeWorkStep = async (workStepId: string) => {
    loading.value = true
    error.value = null
    try {
      const completedStep = await api.workStep.updateWorkStep(workStepId, {
        status: TaskStatusEnum.COMPLETED,
        completedAt: new Date().toISOString(),
      })

      workStepStore.updateWorkStep(completedStep)

      const workflow = workStepStore.getWorkflowForStep(workStepId)
      if (!workflow) {
        throw new Error('Workflow not found for work step')
      }

      // Always notify workflow manager when a task is completed
      await notifyWorkflowManagerTaskCompleted(workflow.id, completedStep, workflow.workflowManagerId)

      const nextStep = findNextWorkStep(workflow.id, completedStep.sequenceNumber)

      if (nextStep) {
        const assignedStep = await assignNextWorkStep(nextStep.id, nextStep.requiredRole)
        // Additional notification if next step was assigned
        if (assignedStep) {
          await notifyWorkflowManager(workflow.id, completedStep, assignedStep)
        }
      } else {
        await notifyWorkflowCompletion(workflow.id)
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to complete work step')
      throw err
    } finally {
      loading.value = false
    }
  }

  function findNextWorkStep(
    workflowId: string,
    currentSequenceNumber: number
  ): WorkStep | null {
    const workflowSteps = workStepStore.getWorkStepsByWorkflow(workflowId)
    const nextSequence = currentSequenceNumber + 1
    return (
      workflowSteps.find((step) => step.sequenceNumber === nextSequence) || null
    )
  }

  async function assignNextWorkStep(
    workStepId: string,
    requiredRole: string
  ): Promise<WorkStep | null> {
    try {
      const availableActors = await api.workStep.getAvailableActors(requiredRole)

      if (availableActors.length > 0 && availableActors[0]) {
        const assigneeId = availableActors[0].id
        const assignedStep = await api.workStep.assignWorkStep(workStepId, assigneeId)

        workStepStore.updateWorkStep(assignedStep)

        const assignedUserIds = Array.isArray(assignedStep.assignedTo) 
          ? assignedStep.assignedTo 
          : assignedStep.assignedTo 
            ? [assignedStep.assignedTo] 
            : []
        
        assignedUserIds.forEach((userId) => {
          notificationStore.addNotification({
            id: `notification-auto-assign-${Date.now()}-${userId}-${Math.random()}`,
            userId,
            title: 'New Task Assigned',
            message: `You have been automatically assigned to task: "${assignedStep.title}"`,
            type: 'INFO',
            read: false,
            createdAt: new Date(),
            relatedEntityId: workStepId,
            relatedEntityType: 'WORKSTEP',
            workflowId: assignedStep.workflowId,
            workStepId,
          })
        })
        
        return assignedStep
      }
      return null
    } catch (err) {
      console.warn('Failed to assign work step automatically:', err)
      return null
    }
  }

  /**
   * Notify workflow manager and admins when a task is completed
   */
  async function notifyWorkflowManagerTaskCompleted(
    workflowId: string,
    completedStep: WorkStep,
    workflowManagerId: string
  ): Promise<void> {
    // Notify workflow manager
    if (workflowManagerId && workflowManagerId !== 'system') {
      notificationStore.addNotification({
        id: `notification-completed-${Date.now()}-${workflowManagerId}`,
        userId: workflowManagerId,
        title: 'Task Completed',
        message: `Task "${completedStep.title}" has been completed by a user.`,
        type: 'SUCCESS',
        read: false,
        createdAt: new Date(),
        relatedEntityId: workflowId,
        relatedEntityType: 'WORKFLOW',
        workflowId,
        workStepId: completedStep.id,
      })
    }

    // Notify all admins
    try {
      const actorGuids = await api.actor.getAllActors()
      const actors = await Promise.all(
        actorGuids.map((guid: string) => api.actor.getActor(guid))
      )
      
      // Find all admin users
      const adminActors = actors.filter((actor) => actor.role?.isAdmin === true)
      
      // Send notification to each admin
      adminActors.forEach((adminActor) => {
        notificationStore.addNotification({
          id: `notification-completed-admin-${Date.now()}-${adminActor.guid}-${Math.random()}`,
          userId: adminActor.guid,
          title: 'Task Completed',
          message: `Task "${completedStep.title}" has been completed by a user.`,
          type: 'SUCCESS',
          read: false,
          createdAt: new Date(),
          relatedEntityId: workflowId,
          relatedEntityType: 'WORKFLOW',
          workflowId,
          workStepId: completedStep.id,
        })
      })
      
      if (adminActors.length > 0) {
        console.log(`[useWorkStep] Notified ${adminActors.length} admin(s) about task completion`)
      }
    } catch (err) {
      console.warn('[useWorkStep] Failed to notify admins about task completion:', err)
      // Don't throw - this is not critical, workflow manager notification already sent
    }
  }

  async function notifyWorkflowManager(
    workflowId: string,
    completedStep: WorkStep,
    nextStep: WorkStep
  ): Promise<void> {
    const workflow = workStepStore.getWorkflowForStep(completedStep.id)
    if (!workflow) return

    if (!workflow.workflowManagerId || workflow.workflowManagerId === 'system') {
      console.warn('[useWorkStep] Cannot notify workflow manager: invalid workflowManagerId')
      return
    }

    notificationStore.addNotification({
      id: `notification-next-step-${Date.now()}-${workflow.workflowManagerId}`,
      userId: workflow.workflowManagerId,
      title: 'Work Step Completed',
      message: `Work step "${completedStep.title}" completed. Next step "${nextStep.title}" assigned.`,
      type: 'SUCCESS',
      read: false,
      createdAt: new Date(),
      relatedEntityId: workflowId,
      relatedEntityType: 'WORKFLOW',
      workflowId,
      workStepId: completedStep.id,
    })
  }

  async function notifyWorkflowCompletion(workflowId: string): Promise<void> {
    const workflow = workStepStore.getWorkflowForStep(workflowId)
    if (!workflow) return

    notificationStore.addNotification({
      id: `notification-${Date.now()}`,
      userId: workflow.workflowManagerId,
      title: 'Workflow Completed',
      message: `Workflow "${workflow.name}" has been completed.`,
      type: 'SUCCESS',
      read: false,
      createdAt: new Date(),
      relatedEntityId: workflowId,
      relatedEntityType: 'WORKFLOW',
      workflowId,
    })
  }

  /**
   * Update a work step
   * Real-time updates: This automatically updates the store, which triggers
   * reactivity in all views. Actors with their work step lists open will
   * see changes immediately without needing to refresh.
   */
  const updateWorkStep = async (
    id: string,
    request: UpdateWorkStepRequest
  ): Promise<WorkStep> => {
    loading.value = true
    error.value = null
    try {
      console.log('[useWorkStep] Updating work step:', id, 'with request:', request)
      
      const oldWorkStep = workStepStore.getWorkStepById(id)
      if (!oldWorkStep) {
        throw new Error(`Work step with id ${id} not found in store`)
      }
      
      console.log('[useWorkStep] Old work step:', oldWorkStep)
      
      const workStep = await api.workStep.updateWorkStep(id, request, oldWorkStep)
      
      console.log('[useWorkStep] Updated work step from API:', workStep)
      
      // Update store - this triggers automatic reactivity updates in all views
      // Vue reactivity will automatically update all computed properties that depend on workSteps
      workStepStore.updateWorkStep(workStep)
      
      console.log('[useWorkStep] Store updated successfully - all views will update automatically')
      console.log('[useWorkStep] SignalR will broadcast this change to other browser tabs/windows')
      
      // Notify users when assigned to a task
      if (request.assignedTo !== undefined && oldWorkStep) {
        const oldAssignees = Array.isArray(oldWorkStep.assignedTo)
          ? oldWorkStep.assignedTo
          : oldWorkStep.assignedTo ? [oldWorkStep.assignedTo] : []
        
        const newAssignees = Array.isArray(workStep.assignedTo)
          ? workStep.assignedTo
          : workStep.assignedTo ? [workStep.assignedTo] : []
        
        // Notify newly assigned users
        newAssignees.forEach((userId) => {
          if (!oldAssignees.includes(userId)) {
            notificationStore.addNotification({
              id: `notification-assigned-${Date.now()}-${userId}-${Math.random()}`,
              userId,
              title: 'New Task Assigned',
              message: `You have been assigned to task: "${workStep.title}"`,
              type: 'INFO',
              read: false,
              createdAt: new Date(),
              relatedEntityId: workStep.id,
              relatedEntityType: 'WORKSTEP',
              workflowId: workStep.workflowId,
              workStepId: workStep.id,
            })
          }
        })
      }

      // Notify workflow manager and admins when task status changes to COMPLETED
      if (request.status === TaskStatusEnum.COMPLETED && oldWorkStep && oldWorkStep.status !== TaskStatusEnum.COMPLETED) {
        const workflow = workStepStore.getWorkflowForStep(id)
        if (workflow) {
          // Notify workflow manager
          if (workflow.workflowManagerId && workflow.workflowManagerId !== 'system') {
            notificationStore.addNotification({
              id: `notification-completed-status-${Date.now()}-${workflow.workflowManagerId}`,
              userId: workflow.workflowManagerId,
              title: 'Task Completed',
              message: `Task "${workStep.title}" has been marked as completed.`,
              type: 'SUCCESS',
              read: false,
              createdAt: new Date(),
              relatedEntityId: workflow.id,
              relatedEntityType: 'WORKFLOW',
              workflowId: workflow.id,
              workStepId: id,
            })
          }

          // Notify all admins
          try {
            const actorGuids = await api.actor.getAllActors()
            const actors = await Promise.all(
              actorGuids.map((guid: string) => api.actor.getActor(guid))
            )
            
            // Find all admin users
            const adminActors = actors.filter((actor) => actor.role?.isAdmin === true)
            
            // Send notification to each admin
            adminActors.forEach((adminActor) => {
              notificationStore.addNotification({
                id: `notification-completed-admin-status-${Date.now()}-${adminActor.guid}-${Math.random()}`,
                userId: adminActor.guid,
                title: 'Task Completed',
                message: `Task "${workStep.title}" has been marked as completed.`,
                type: 'SUCCESS',
                read: false,
                createdAt: new Date(),
                relatedEntityId: workflow.id,
                relatedEntityType: 'WORKFLOW',
                workflowId: workflow.id,
                workStepId: id,
              })
            })
            
            if (adminActors.length > 0) {
              console.log(`[useWorkStep] Notified ${adminActors.length} admin(s) about task completion (status change)`)
            }
          } catch (err) {
            console.warn('[useWorkStep] Failed to notify admins about task completion (status change):', err)
            // Don't throw - this is not critical
          }
        }
      }

      if (request.manualPriority) {
        const workflow = workStepStore.getWorkflowForStep(id)
        if (workflow) {
          notificationStore.addNotification({
            id: `notification-priority-${Date.now()}`,
            userId: workflow.workflowManagerId,
            title: 'Work Step Priority Changed',
            message: `Priority for "${workStep.title}" has been updated.`,
            type: 'INFO',
            read: false,
            createdAt: new Date(),
            relatedEntityId: workflow.id,
            relatedEntityType: 'WORKFLOW',
            workflowId: workflow.id,
            workStepId: id,
          })
        }
      }

      return workStep
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update work step')
      throw err
    } finally {
      loading.value = false
    }
  }

  const prioritizedWorkSteps = computed(() => {
    return workStepStore.prioritizedWorkSteps
  })

  /**
   * Get work steps assigned to the current user
   * Optimized for fast personal task list access (< 0.5s target)
   * Uses efficient O(n) filter operation from store
   * Automatically reactive - updates when store changes
   */
  const myWorkSteps = computed(() => {
    if (!userStore.currentUser) return []
    // getAssignedWorkSteps is an efficient O(n) filter operation
    // Returns already filtered and ready-to-display work steps
    return workStepStore.getAssignedWorkSteps(userStore.currentUser.id)
  })

  const deleteWorkStep = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.workStep.deleteWorkStep(id)
      workStepStore.removeWorkStep(id)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to delete work step')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    workSteps: computed(() => workStepStore.workSteps),
    currentWorkStep: computed(() => workStepStore.currentWorkStep),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    loadWorkSteps,
    loadMyWorkSteps,
    createWorkStep,
    completeWorkStep,
    updateWorkStep,
    deleteWorkStep,
    prioritizedWorkSteps,
    myWorkSteps,
  }
}

