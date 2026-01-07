<!--
  ActorWorkStepsView - Container Component
  Shows all work steps for a specific actor/user
  Allows workflow manager to view and manage actor's work steps
-->
<template>
  <div class="actor-worksteps-view">
    <div class="view-header">
      <h3>{{ actor?.displayName || 'User' }}'s Work Steps</h3>
      <span class="view-badge">{{ workSteps.length }} steps</span>
    </div>

    <div v-if="workSteps.length === 0" class="empty-state">
      <p>No work steps assigned to this actor.</p>
    </div>

    <div v-else class="worksteps-list">
      <WorkStepCard
        v-for="workStep in sortedWorkSteps"
        :key="workStep.id"
        :work-step="workStep"
        :priority="getPriorityForStep(workStep)"
        :is-urgent="isUrgentStep(workStep)"
        :is-deadline-approaching="isDeadlineApproachingStep(workStep)"
        :assigned-users-map="assignedUsersMap"
      >
        <template #actions="{ workStep }">
          <button
            v-if="canManage"
            @click="handleSetPriority(workStep.id)"
            class="btn btn--secondary btn--small"
          >
            Change Priority
          </button>
        </template>
      </WorkStepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useWorkStep } from '@/composables/useWorkStep'
import { useWorkflowManager } from '@/composables/useWorkflowManager'
import { useAuthorization } from '@/composables/useAuthorization'
import { useWorkflow } from '@/composables/useWorkflow'
import { useActor } from '@/composables/useActor'
import WorkStepCard from '@/components/presenters/WorkStepCard.vue'
import type { WorkStep, User } from '@/types/domain'
import { Priority } from '@/types/domain'
import type { ActorDto } from '@/types/api'

interface Props {
  actorId: string
  workflowId?: string
}

const props = defineProps<Props>()

const { workSteps, loadWorkSteps } = useWorkStep()
const { workflows } = useWorkflow()
const { setManualPriority } = useWorkflowManager()
const { canManageWorkflow } = useAuthorization()
const { actors, loadActors, getActor } = useActor()

const actor = ref<ActorDto | null>(null)

// Create map of user IDs to usernames for display
const assignedUsersMap = computed(() => {
  const map = new Map<string, string>()
  actors.value.forEach((a) => {
    map.set(a.guid, a.displayName)
  })
  return map
})

onMounted(async () => {
  await loadActors()
  try {
    actor.value = await getActor(props.actorId)
  } catch (err) {
    console.error('Failed to load actor:', err)
  }
})

const filteredWorkSteps = computed(() => {
  let steps = workSteps.value.filter((ws) => {
    if (!ws.assignedTo) return false
    if (Array.isArray(ws.assignedTo)) {
      return ws.assignedTo.includes(props.actorId)
    }
    return ws.assignedTo === props.actorId
  })
  if (props.workflowId) {
    steps = steps.filter((ws) => ws.workflowId === props.workflowId)
  }
  return steps
})

const sortedWorkSteps = computed(() => {
  return [...filteredWorkSteps.value].sort((a, b) => {
    // Sort by priority first, then by sequence number
    const aPriority = getPriorityForStep(a)
    const bPriority = getPriorityForStep(b)
    const priorityOrder: Record<Priority, number> = {
      [Priority.SHORT_TERM]: 0,
      [Priority.MID_TERM]: 1,
      [Priority.LONG_TERM]: 2,
    }
    const aPriorityValue = priorityOrder[aPriority] ?? 2
    const bPriorityValue = priorityOrder[bPriority] ?? 2
    if (aPriorityValue !== bPriorityValue) {
      return aPriorityValue - bPriorityValue
    }
    return a.sequenceNumber - b.sequenceNumber
  })
})

const canManage = computed(() => {
  if (!props.workflowId) return true // Can manage if no specific workflow
  return canManageWorkflow(props.workflowId).allowed
})

function getPriorityForStep(workStep: WorkStep): Priority {
  return workStep.manualPriority || workStep.priority
}

function isUrgentStep(workStep: WorkStep): boolean {
  const priority = getPriorityForStep(workStep)
  return priority === Priority.SHORT_TERM
}

function isDeadlineApproachingStep(workStep: WorkStep): boolean {
  const workflow = workflows.value.find((w) => w.id === workStep.workflowId)
  if (!workflow || !workflow.deadline) return false
  const now = new Date()
  const deadline = new Date(workflow.deadline)
  const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursUntilDeadline <= 24 && hoursUntilDeadline > 0
}

async function handleSetPriority(workStepId: string) {
  const priorities: Priority[] = [
    Priority.SHORT_TERM,
    Priority.MID_TERM,
    Priority.LONG_TERM,
  ]
  const workStep = filteredWorkSteps.value.find((ws) => ws.id === workStepId)
  if (!workStep) return

  const currentPriority = getPriorityForStep(workStep)
  const currentIndex = priorities.indexOf(currentPriority)
  if (currentIndex === -1) return

  const nextPriority = priorities[(currentIndex + 1) % priorities.length]
  if (!nextPriority) return

  try {
    await setManualPriority(workStepId, nextPriority)
    await loadWorkSteps() // Reload to get updated priority
  } catch (err) {
    console.error('Failed to set priority:', err)
  }
}
</script>

<style scoped>
.actor-worksteps-view {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-light);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.view-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.view-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-primary-light);
  color: var(--color-text-inverse);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

.empty-state {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-tertiary);
}

.worksteps-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn--small {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-xs);
}

.btn--secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn--secondary:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}
</style>

