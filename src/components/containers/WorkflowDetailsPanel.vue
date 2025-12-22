<!--
  WorkflowDetailsPanel - Container Component
  Shows detailed workflow information with work steps
-->
<template>
  <div class="workflow-details-panel">
    <div v-if="workflow" class="panel-header">
      <div class="header-content">
        <h2>{{ workflow.name }}</h2>
        <div v-if="canManage" class="header-actions">
          <button @click="showEditWorkflowForm = !showEditWorkflowForm" class="btn btn--secondary btn--small">
            ✏️ Edit Workflow
          </button>
          <button @click="handleDeleteWorkflow" class="btn btn--danger btn--small">
            🗑️ Delete
          </button>
        </div>
      </div>
      <button @click="$emit('close')" class="btn-close">×</button>
    </div>

    <!-- Edit Workflow Form -->
    <EditWorkflowForm
      v-if="showEditWorkflowForm && workflow"
      :show-form="showEditWorkflowForm"
      :workflow="workflow"
      @close="showEditWorkflowForm = false"
      @updated="handleWorkflowUpdated"
    />

    <div v-if="progress" class="panel-progress">
      <WorkflowProgressCard :workflow-id="workflowId" />
    </div>

    <div class="panel-worksteps">
      <div class="worksteps-header">
        <h3>Work Steps</h3>
        <button
          v-if="canManage"
          @click="showCreateStepForm = !showCreateStepForm"
          class="btn btn--primary btn--small"
        >
          + Add Work Step
        </button>
      </div>

      <!-- Create Work Step Form -->
      <CreateWorkStepForm
        v-if="showCreateStepForm"
        :show-form="showCreateStepForm"
        :workflow-id="workflowId"
        @close="showCreateStepForm = false"
        @created="handleWorkStepCreated"
      />

      <!-- Edit Work Step Form -->
      <EditWorkStepForm
        v-if="showEditStepForm && editingWorkStep"
        :show-form="showEditStepForm"
        :work-step="editingWorkStep"
        @close="handleCloseEdit"
        @updated="handleWorkStepUpdated"
      />

      <div v-if="workSteps.length === 0" class="empty-state">
        <p>No work steps found. Create the first work step to get started.</p>
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
          @complete="handleComplete"
        >
          <template #actions="{ workStep }">
            <div class="card-actions-group">
              <button
                v-if="canManage"
                @click="handleEdit(workStep)"
                class="btn btn--secondary btn--small"
                title="Edit work step"
              >
                ✏️ Edit
              </button>
              <button
                v-if="canManage"
                @click="handleSetPriority(workStep.id)"
                class="btn btn--secondary btn--small"
                title="Change priority"
              >
                ⚡ Priority
              </button>
              <button
                v-if="canManage"
                @click="handleDelete(workStep.id)"
                class="btn btn--danger btn--small"
                title="Delete work step"
              >
                🗑️ Delete
              </button>
              <button
                v-if="workStep.status !== 'COMPLETED'"
                @click="$emit('complete', workStep.id)"
                class="btn btn--primary btn--small"
                title="Mark as completed"
              >
                ✓ Complete
              </button>
            </div>
          </template>
        </WorkStepCard>
      </div>
    </div>

    <!-- Actors Overview -->
    <div v-if="canManage" class="panel-actors">
      <h3>Actors Overview</h3>
      <div class="actors-list">
        <div
          v-for="actor in assignedActors"
          :key="actor.id"
          class="actor-item"
          @click="selectedActorId = selectedActorId === actor.id ? null : actor.id"
        >
          <div class="actor-info">
            <span class="actor-name">{{ actor.username }}</span>
            <span class="actor-role">{{ actor.role }}</span>
            <span class="actor-steps-count">
              {{ getActorWorkStepsCount(actor.id) }} steps
            </span>
          </div>
          <ActorWorkStepsView
            v-if="selectedActorId === actor.id"
            :actor-id="actor.id"
            :workflow-id="workflowId"
            class="actor-details"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorkflow } from '@/composables/useWorkflow'
import { useWorkStep } from '@/composables/useWorkStep'
import { useWorkflowManager } from '@/composables/useWorkflowManager'
import { useAuthorization } from '@/composables/useAuthorization'
import WorkflowProgressCard from './WorkflowProgressCard.vue'
import WorkStepCard from '@/components/presenters/WorkStepCard.vue'
import CreateWorkStepForm from './CreateWorkStepForm.vue'
import EditWorkStepForm from './EditWorkStepForm.vue'
import EditWorkflowForm from './EditWorkflowForm.vue'
import ActorWorkStepsView from './ActorWorkStepsView.vue'
import { mockUsers } from '@/services/mock/mockData'
import type { WorkStep, Priority, User } from '@/types/domain'
import { Priority as PriorityEnum } from '@/types/domain'

interface Props {
  workflowId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  complete: [id: string]
  deleted: [workflowId: string]
}>()

const { workflows, loadWorkflows, deleteWorkflow } = useWorkflow()
const { workSteps, loadWorkSteps: reloadWorkSteps, deleteWorkStep } = useWorkStep()
const { getWorkflowProgress, setManualPriority } = useWorkflowManager()
const { canManageWorkflow: checkCanManageWorkflow } = useAuthorization()
const { completeWorkStep, loadWorkSteps } = useWorkStep()

const showCreateStepForm = ref(false)
const showEditStepForm = ref(false)
const showEditWorkflowForm = ref(false)
const editingWorkStep = ref<WorkStep | null>(null)
const selectedActorId = ref<string | null>(null)

const workflow = computed(() => workflows.value.find((w) => w.id === props.workflowId))
const progress = computed(() => {
  try {
    return getWorkflowProgress(props.workflowId)
  } catch {
    return null
  }
})

const workflowWorkSteps = computed(() => {
  return workSteps.value.filter((ws) => ws.workflowId === props.workflowId)
})

const sortedWorkSteps = computed(() => {
  return [...workflowWorkSteps.value].sort((a, b) => a.sequenceNumber - b.sequenceNumber)
})

onMounted(async () => {
  await loadWorkflows()
  await reloadWorkSteps()
})

function getPriorityForStep(workStep: WorkStep): Priority {
  return workStep.manualPriority || workStep.priority
}

function isUrgentStep(workStep: WorkStep): boolean {
  const priority = getPriorityForStep(workStep)
  return priority === PriorityEnum.IMMEDIATE
}

function isDeadlineApproachingStep(workStep: WorkStep): boolean {
  if (!workflow.value || !workflow.value.deadline) return false
  const now = new Date()
  const deadline = new Date(workflow.value.deadline)
  const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursUntilDeadline <= 24 && hoursUntilDeadline > 0
}

async function handleComplete(workStepId: string) {
  try {
    // completeWorkStep updates the store directly, Vue reactivity handles UI updates
    // No need to reload - the panel will update in real-time
    await completeWorkStep(workStepId)
  } catch (err) {
    console.error('Failed to complete work step:', err)
    alert('Failed to complete work step. Please try again.')
  }
}

async function handleSetPriority(workStepId: string) {
  const priorities: Priority[] = [PriorityEnum.IMMEDIATE, PriorityEnum.MEDIUM_TERM, PriorityEnum.LONG_TERM]
  const workStep = workflowWorkSteps.value.find((ws) => ws.id === workStepId)
  if (!workStep) return
  
  const currentPriority = getPriorityForStep(workStep)
  const currentIndex = priorities.indexOf(currentPriority)
  if (currentIndex === -1) return
  
  const nextPriority = priorities[(currentIndex + 1) % priorities.length]
  if (!nextPriority) return
  
  try {
    // setManualPriority updates the store directly, Vue reactivity handles UI updates
    // No need to reload - the panel will update in real-time
    await setManualPriority(workStepId, nextPriority)
  } catch (err) {
    console.error('Failed to set priority:', err)
  }
}

const canManage = computed(() => {
  return checkCanManageWorkflow(props.workflowId).allowed
})

// Get all actors assigned to work steps in this workflow (supports multiple assignments)
const assignedActors = computed(() => {
  const actorIds = new Set<string>()
  workflowWorkSteps.value.forEach((ws) => {
    if (ws.assignedTo) {
      if (Array.isArray(ws.assignedTo)) {
        ws.assignedTo.forEach((userId) => actorIds.add(userId))
      } else {
        actorIds.add(ws.assignedTo)
      }
    }
  })
  return mockUsers.filter((user) => actorIds.has(user.id))
})

function getActorWorkStepsCount(actorId: string): number {
  return workflowWorkSteps.value.filter((ws) => {
    if (!ws.assignedTo) return false
    if (Array.isArray(ws.assignedTo)) {
      return ws.assignedTo.includes(actorId)
    }
    return ws.assignedTo === actorId
  }).length
}

// Create map of user IDs to usernames for display
const assignedUsersMap = computed(() => {
  const map = new Map<string, string>()
  mockUsers.forEach((user) => {
    map.set(user.id, user.username)
  })
  return map
})

async function handleWorkStepCreated(workStepId: string) {
  showCreateStepForm.value = false
  await reloadWorkSteps()
}

function handleEdit(workStep: WorkStep) {
  editingWorkStep.value = workStep
  showEditStepForm.value = true
}

function handleCloseEdit() {
  showEditStepForm.value = false
  editingWorkStep.value = null
}

async function handleWorkStepUpdated(workStepId: string) {
  showEditStepForm.value = false
  editingWorkStep.value = null
  await reloadWorkSteps()
}

async function handleDelete(workStepId: string) {
  if (!confirm('Are you sure you want to delete this work step? This action cannot be undone.')) {
    return
  }

  try {
    await deleteWorkStep(workStepId)
    await reloadWorkSteps()
  } catch (err) {
    console.error('Failed to delete work step:', err)
    alert('Failed to delete work step. Please try again.')
  }
}

async function handleDeleteWorkflow() {
  if (!workflow.value) return

  if (!confirm(`Are you sure you want to delete workflow "${workflow.value.name}"? This will also delete all associated work steps. This action cannot be undone.`)) {
    return
  }

  try {
    await deleteWorkflow(workflow.value.id)
    emit('deleted', workflow.value.id)
    emit('close')
    // Reload workflows list
    await loadWorkflows()
  } catch (err) {
    console.error('Failed to delete workflow:', err)
    alert('Failed to delete workflow. Please try again.')
  }
}

async function handleWorkflowUpdated(workflowId: string) {
  showEditWorkflowForm.value = false
  await loadWorkflows()
  await reloadWorkSteps()
}
</script>

<style scoped>
.workflow-details-panel {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: var(--spacing-md);
}

.header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.panel-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #333;
}

.panel-progress {
  margin-bottom: 2rem;
}

.worksteps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.worksteps-header h3 {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.panel-worksteps h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.panel-actors {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 2px solid var(--color-border);
}

.panel-actors h3 {
  margin-bottom: var(--spacing-lg);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.actors-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.actor-item {
  background: var(--color-background);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: all var(--transition-base);
}

.actor-item:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary-light);
}

.actor-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.actor-name {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.actor-role {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-info-light);
  color: var(--color-info);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.actor-steps-count {
  margin-left: auto;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.actor-details {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #888;
}

.worksteps-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.875rem;
}

.btn:hover {
  background: #f5f5f5;
}

.btn--primary {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.btn--primary:hover {
  background: #1976d2;
}

.btn--secondary {
  background: #ff9800;
  color: white;
  border-color: #ff9800;
}

.btn--secondary:hover {
  background: #f57c00;
}

.btn--danger {
  background: #f44336;
  color: white;
  border-color: #f44336;
}

.btn--danger:hover {
  background: #d32f2f;
}

.card-actions-group {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}
</style>

