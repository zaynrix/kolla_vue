<!--
  WorkflowDetailsPanel - Container Component
  Shows detailed workflow information with work steps
-->
<template>
  <div class="workflow-details-panel">
    <div v-if="workflow" class="panel-header">
      <div class="header-content">
        <div class="header-title-section">
          <h2>{{ workflow.name }}</h2>
          <div v-if="workflow.deadline" class="workflow-deadline-badge">
            <svg class="deadline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="deadline-label">Deadline:</span>
            <span class="deadline-date">{{ formatDeadline(workflow.deadline) }}</span>
          </div>
        </div>
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
        <div v-if="canManage" class="worksteps-actions">
          <button
            @click="handleAddTestWorkSteps"
            :disabled="creatingTestSteps"
            class="btn btn--test btn--small"
            title="Add multiple test work steps for testing"
          >
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span v-if="creatingTestSteps">Creating...</span>
            <span v-else>Add Test Steps</span>
          </button>
          <button
            @click="showCreateStepForm = !showCreateStepForm"
            class="btn btn--primary btn--small"
          >
            + Add Work Step
          </button>
        </div>
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

      <!-- 
        Work Steps List - Optimized for performance with 20+ tasks per workflow
        - Uses memoized priority calculations (computed once per render cycle)
        - Vue reactivity ensures real-time updates via SignalR
        - No manual reload needed - store updates trigger automatic UI refresh
      -->
      <div v-else class="worksteps-list">
        <WorkStepCard
          v-for="workStep in sortedWorkSteps"
          :key="workStep.id"
          :work-step="workStep"
          :priority="getPriorityForStep(workStep)"
          :is-urgent="isUrgentStep(workStep)"
          :is-deadline-approaching="isDeadlineApproachingStep(workStep)"
          :assigned-users-map="assignedUsersMap"
          :workflow-deadline="workflow?.deadline"
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
      <h3>Users Overview</h3>
      <div class="actors-list">
        <div
          v-for="actor in assignedActors"
          :key="actor.guid"
          class="actor-item"
          @click="selectedActorId = selectedActorId === actor.guid ? null : actor.guid"
        >
          <div class="actor-info">
            <span class="actor-name">{{ actor.displayName }}</span>
            <span class="actor-role">{{ actor.role?.displayName || 'No role' }}</span>
            <span class="actor-steps-count">
              {{ getActorWorkStepsCount(actor.guid) }} steps
            </span>
          </div>
          <ActorWorkStepsView
            v-if="selectedActorId === actor.guid"
            :actor-id="actor.guid"
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
import { useActor } from '@/composables/useActor'
import { useRole } from '@/composables/useRole'
import { useWorkStepStore } from '@/stores/workStep'
import type { WorkStep, Priority, User } from '@/types/domain'
import { Priority as PriorityEnum, Role } from '@/types/domain'

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
const { workSteps, loadWorkSteps: reloadWorkSteps, deleteWorkStep, createWorkStep } = useWorkStep()
const { getWorkflowProgress } = useWorkflowManager()
const { canManageWorkflow: checkCanManageWorkflow } = useAuthorization()
const { completeWorkStep, loadWorkSteps } = useWorkStep()
const { actors, loadActors } = useActor()
const { roles, loadRoles } = useRole()
const creatingTestSteps = ref(false)

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

// Memoized priority calculations for all steps - computed once per render cycle
// This ensures performance stays good even with 20+ tasks per workflow
// The computed property automatically recalculates when workSteps or workflow changes,
// ensuring the display stays current without manual reloads
const workStepStore = useWorkStepStore()
const stepPriorities = computed(() => {
  const now = new Date()
  const priorities = new Map<string, Priority>()
  const urgentFlags = new Map<string, boolean>()
  const deadlineApproachingFlags = new Map<string, boolean>()
  
  // Calculate all priorities in one pass for optimal performance
  sortedWorkSteps.value.forEach((workStep) => {
    // Calculate priority once per step
    const priority = workStep.manualPriority || workStepStore.calculatePriority(workStep, now)
    priorities.set(workStep.id, priority)
    urgentFlags.set(workStep.id, priority === PriorityEnum.SHORT_TERM)
    
    // Calculate deadline approaching flag
    if (workflow.value?.deadline) {
      const deadline = new Date(workflow.value.deadline)
      const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
      deadlineApproachingFlags.set(workStep.id, hoursUntilDeadline <= 24 && hoursUntilDeadline > 0)
    } else {
      deadlineApproachingFlags.set(workStep.id, false)
    }
  })
  
  return { priorities, urgentFlags, deadlineApproachingFlags }
})

onMounted(async () => {
  await Promise.all([loadActors(), loadWorkflows()])
  await reloadWorkSteps()
})

// Optimized functions that use memoized values
function getPriorityForStep(workStep: WorkStep): Priority {
  return stepPriorities.value.priorities.get(workStep.id) || PriorityEnum.LONG_TERM
}

function isUrgentStep(workStep: WorkStep): boolean {
  return stepPriorities.value.urgentFlags.get(workStep.id) || false
}

function isDeadlineApproachingStep(workStep: WorkStep): boolean {
  return stepPriorities.value.deadlineApproachingFlags.get(workStep.id) || false
}

function formatDeadline(deadline: Date): string {
  return new Date(deadline).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

// Priority is automatically calculated by the backend based on workflow deadline and duration
// Manual priority changes are not allowed

const canManage = computed(() => {
  return checkCanManageWorkflow(props.workflowId).allowed
})


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
  return actors.value.filter((actor) => actorIds.has(actor.guid))
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
  actors.value.forEach((actor) => {
    map.set(actor.guid, actor.displayName)
  })
  return map
})

async function handleWorkStepCreated(workStepId: string) {
  showCreateStepForm.value = false
  await reloadWorkSteps()
}

async function handleAddTestWorkSteps() {
  if (creatingTestSteps.value || !workflow.value) return

  // Ensure actors and roles are loaded
  if (actors.value.length === 0) {
    await loadActors()
  }
  if (roles.value.length === 0) {
    await loadRoles()
  }

  // Get available actors and roles
  const availableActors = actors.value.filter(a => !a.role?.isAdmin)
  const availableRoles = roles.value.filter(r => !r.isAdmin)
  const defaultRole = availableRoles[0] || roles.value[0]

  if (availableActors.length === 0) {
    alert('No users found. Please create users first before adding test work steps.')
    return
  }

  // Calculate dates based on workflow deadline
  const now = new Date()
  const workflowDeadline = workflow.value.deadline ? new Date(workflow.value.deadline) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const daysUntilDeadline = Math.max(1, Math.floor((workflowDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  const stepDuration = Math.max(1, Math.floor(daysUntilDeadline / 8)) // Divide remaining time into 8 steps

  const testSteps = [
    { title: 'Requirements Gathering', description: 'Collect and document all project requirements', duration: stepDuration * 24 },
    { title: 'Design Phase', description: 'Create UI/UX designs and mockups', duration: stepDuration * 24 },
    { title: 'Development Setup', description: 'Set up development environment and tools', duration: stepDuration * 24 },
    { title: 'Backend Development', description: 'Implement backend APIs and services', duration: stepDuration * 24 },
    { title: 'Frontend Development', description: 'Build user interface components', duration: stepDuration * 24 },
    { title: 'Integration Testing', description: 'Test integration between components', duration: stepDuration * 24 },
    { title: 'User Acceptance Testing', description: 'Conduct UAT with stakeholders', duration: stepDuration * 24 },
    { title: 'Deployment', description: 'Deploy to production environment', duration: stepDuration * 24 },
  ]

  creatingTestSteps.value = true
  const created: string[] = []
  const failed: string[] = []

  try {
    // Calculate next sequence number
    const currentMaxSequence = sortedWorkSteps.value.length > 0
      ? Math.max(...sortedWorkSteps.value.map(ws => ws.sequenceNumber || 0))
      : 0

    for (let i = 0; i < testSteps.length; i++) {
      try {
        const step = testSteps[i]
        const sequenceNumber = currentMaxSequence + i + 1
        
        // Calculate start and deadline dates
        const startDate = new Date(now.getTime() + i * stepDuration * 24 * 60 * 60 * 1000)
        const deadlineDate = new Date(startDate.getTime() + step.duration * 60 * 60 * 1000)

        // Ensure deadline doesn't exceed workflow deadline
        if (deadlineDate > workflowDeadline) {
          deadlineDate.setTime(workflowDeadline.getTime())
        }

        // Assign to random actor
        const assignedActor = availableActors[i % availableActors.length]

        await createWorkStep({
          title: step.title,
          description: step.description,
          duration: step.duration,
          workflowId: props.workflowId,
          sequenceNumber: sequenceNumber,
          requiredRole: Role.TEAM_MEMBER,
          assignedTo: assignedActor.guid,
          startDate: startDate.toISOString(),
          deadlineDate: deadlineDate.toISOString(),
        })
        created.push(step.title)
        console.log(`[Test Work Steps] Created step: ${step.title}`)
      } catch (err) {
        console.error(`[Test Work Steps] Failed to create step "${testSteps[i].title}":`, err)
        failed.push(testSteps[i].title)
      }
    }

    await reloadWorkSteps()

    if (created.length > 0) {
      const message = failed.length > 0
        ? `Created ${created.length} test work step(s). ${failed.length} step(s) failed.`
        : `Successfully created ${created.length} test work step(s)!`
      alert(message)
    } else if (failed.length > 0) {
      alert(`Failed to create test work steps. Please check the console for details.`)
    }
  } catch (err) {
    console.error('[Test Work Steps] Error creating test work steps:', err)
    alert('An error occurred while creating test work steps. Please check the console for details.')
  } finally {
    creatingTestSteps.value = false
  }
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
  // No need to reload - store is already updated via updateWorkStep, 
  // and Vue reactivity will automatically update all views
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

.header-title-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.panel-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.workflow-deadline-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
}

.deadline-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.deadline-label {
  font-weight: 600;
}

.deadline-date {
  font-weight: 700;
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
  gap: var(--spacing-md);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-lg);
}

.worksteps-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
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

.btn--test {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
}

.btn--test:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.btn--test:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-actions-group {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

/* Responsive Styles - Device-adapted layout */
@media (max-width: 768px) {
  .workflow-details-panel {
    padding: var(--spacing-md);
    border-radius: 0;
  }

  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-content {
    width: 100%;
  }

  .header-title-section {
    width: 100%;
  }

  .header-actions {
    width: 100%;
    justify-content: stretch;
  }

  .header-actions .btn {
    flex: 1;
    min-width: 0;
  }

  .btn-close {
    align-self: flex-end;
    margin-top: var(--spacing-xs);
  }

  .panel-header h2 {
    font-size: var(--text-lg);
  }

  .workflow-deadline-badge {
    flex-wrap: wrap;
    font-size: var(--text-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .worksteps-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }

  .worksteps-header h3 {
    font-size: var(--text-lg);
  }

  .worksteps-list {
    gap: var(--spacing-md);
  }

  .panel-actors {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-lg);
  }

  .actor-item {
    padding: var(--spacing-sm);
  }

  .actor-info {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .actor-steps-count {
    margin-left: 0;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .workflow-details-panel {
    padding: var(--spacing-sm);
  }

  .panel-header h2 {
    font-size: var(--text-base);
  }

  .workflow-deadline-badge {
    font-size: 0.75rem;
  }

  .worksteps-header h3 {
    font-size: var(--text-base);
  }

  .card-actions-group {
    flex-direction: column;
    width: 100%;
  }

  .card-actions-group .btn {
    width: 100%;
  }
}
</style>

