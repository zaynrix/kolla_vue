<!--
  Actor Dashboard View
  Shows assigned work steps for the current actor with prioritization
  Demonstrates Usability I & II: Multiple views and automatic updates
-->
<template>
  <div class="actor-dashboard">
    <div class="actor-dashboard__header">
      <h1>My Work Steps</h1>
      <div class="actor-dashboard__user-info">
        <span v-if="currentUser">Logged in as: {{ currentUser.username }}</span>
      </div>
    </div>

    <div v-if="loading" class="actor-dashboard__loading">
      Loading work steps...
    </div>

    <div v-else-if="error" class="actor-dashboard__error">
      Error: {{ error.message }}
    </div>

    <div v-else class="actor-dashboard__content">
      <!-- User Selector -->
      <div class="actor-dashboard__user-selector">
        <UserSelector
          :users="availableUsers"
          :selected-user-id="selectedUserId"
          @change="handleUserChange"
        />
      </div>

      <!-- View Selector - Usability I: Multiple representations -->
      <div class="actor-dashboard__view-selector">
        <button
          :class="['view-btn', { 'view-btn--active': viewMode === 'board' }]"
          @click="viewMode = 'board'"
        >
          <span class="view-btn-icon">📋</span>
          Board
        </button>
        <button
          :class="['view-btn', { 'view-btn--active': viewMode === 'cards' }]"
          @click="viewMode = 'cards'"
        >
          <span class="view-btn-icon">📄</span>
          Cards
        </button>
        <button
          :class="['view-btn', { 'view-btn--active': viewMode === 'table' }]"
          @click="viewMode = 'table'"
        >
          <span class="view-btn-icon">📊</span>
          Table
        </button>
      </div>

      <!-- Summary -->
      <div class="actor-dashboard__summary">
        <div class="summary-item">
          <span class="summary-label">Total:</span>
          <span class="summary-value">{{ displayedWorkSteps.length }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">In Progress:</span>
          <span class="summary-value">{{ inProgressCount }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Pending:</span>
          <span class="summary-value">{{ pendingCount }}</span>
        </div>
        <div class="summary-item summary-item--urgent">
          <span class="summary-label">Urgent:</span>
          <span class="summary-value">{{ urgentCount }}</span>
        </div>
      </div>

      <!-- Work Steps List -->
      <div v-if="displayedWorkSteps.length === 0" class="actor-dashboard__empty">
        <p>No work steps assigned{{ selectedUserId ? ' to selected user' : ' to you' }}.</p>
      </div>

      <!-- Board View - Trello/Jira Style -->
      <div v-else-if="viewMode === 'board'" class="actor-dashboard__board">
        <WorkStepBoard
          :work-steps="displayedWorkSteps"
          :assigned-users="assignedUsersMap"
          @select="handleWorkStepSelect"
          @complete="handleComplete"
          @status-change="handleStatusChange"
        />
      </div>

      <!-- Card View -->
      <div v-else-if="viewMode === 'cards'" class="actor-dashboard__cards">
              <WorkStepCard
                v-for="workStep in displayedWorkSteps"
                :key="workStep.id"
                :work-step="workStep"
                :priority="getPriorityForStep(workStep)"
                :is-urgent="isUrgentStep(workStep)"
                :is-deadline-approaching="isDeadlineApproachingStep(workStep)"
                :assigned-users-map="assignedUsersMap"
                @complete="handleComplete"
                @view="handleView"
              />
      </div>

      <!-- Table View - Usability I: Alternative representation -->
      <div v-else-if="viewMode === 'table'" class="actor-dashboard__table">
        <table class="workstep-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Priority</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Workflow</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="workStep in displayedWorkSteps"
              :key="workStep.id"
              :class="{
                'row--urgent': isUrgentStep(workStep),
                'row--completed': workStep.status === 'COMPLETED',
              }"
            >
              <td>
                <strong>{{ workStep.title }}</strong>
                <br />
                <small>{{ workStep.description }}</small>
              </td>
              <td>
                <span :class="['priority-badge', `priority--${getPriorityForStep(workStep).toLowerCase()}`]">
                  {{ getPriorityLabel(getPriorityForStep(workStep)) }}
                </span>
              </td>
              <td>{{ workStep.duration }}h</td>
              <td>
                <span :class="['status-badge', `status--${workStep.status.toLowerCase()}`]">
                  {{ workStep.status }}
                </span>
              </td>
              <td>{{ getWorkflowName(workStep.workflowId) }}</td>
              <td>
                <button
                  v-if="workStep.status !== 'COMPLETED'"
                  @click="handleComplete(workStep.id)"
                  class="btn btn--small btn--primary"
                >
                  Complete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorkStep } from '@/composables/useWorkStep'
import { useWorkflow } from '@/composables/useWorkflow'
import { useUser } from '@/composables/useUser'
import { usePriority } from '@/composables/usePriority'
import WorkStepCard from '@/components/presenters/WorkStepCard.vue'
import WorkStepBoard from '@/components/presenters/WorkStepBoard.vue'
import UserSelector from '@/components/presenters/UserSelector.vue'
import { mockUsers } from '@/services/mock/mockData'
import type { WorkStep, Priority, TaskStatus } from '@/types/domain'
import { Priority as PriorityEnum, TaskStatus as TaskStatusEnum } from '@/types/domain'

type ViewMode = 'board' | 'cards' | 'table'

const viewMode = ref<ViewMode>('board')
const selectedUserId = ref<string>('')
const { myWorkSteps, prioritizedWorkSteps, loading, error, loadMyWorkSteps, completeWorkStep, loadWorkSteps, updateWorkStep } = useWorkStep()
const { workflows, loadWorkflows } = useWorkflow()
const { currentUser, availableUsers: viewModelUsers, setCurrentUser } = useUser()

// Use ViewModel users, fallback to mockUsers if needed
const availableUsers = computed(() => viewModelUsers.value.length > 0 ? viewModelUsers.value : mockUsers)

// Get all work steps or filtered by selected user (supports multiple assignments)
const displayedWorkSteps = computed(() => {
  if (selectedUserId.value) {
    return prioritizedWorkSteps.value.filter((ws) => {
      if (!ws.assignedTo) return false
      if (Array.isArray(ws.assignedTo)) {
        return ws.assignedTo.includes(selectedUserId.value)
      }
      return ws.assignedTo === selectedUserId.value
    })
  }
  return prioritizedWorkSteps.value
})

// Create map of user IDs to usernames
const assignedUsersMap = computed(() => {
  const map = new Map<string, string>()
  mockUsers.forEach((user) => {
    map.set(user.id, user.username)
  })
  return map
})

// Set mock user for prototype
onMounted(async () => {
  // Set mock user (bob - team member)
  if (!currentUser.value) {
    setCurrentUser({
      id: 'user-2',
      username: 'bob',
      email: 'bob@example.com',
      role: 'TEAM_MEMBER' as any,
      tenantId: 'tenant-1',
    })
    selectedUserId.value = 'user-2'
  } else {
    selectedUserId.value = currentUser.value.id
  }
  
  await loadWorkflows()
  await loadWorkSteps() // Load all work steps
  await loadMyWorkSteps()
})

const inProgressCount = computed(() => {
  return displayedWorkSteps.value.filter((ws) => ws.status === 'IN_PROGRESS').length
})

const pendingCount = computed(() => {
  return displayedWorkSteps.value.filter((ws) => ws.status === 'PENDING').length
})

const urgentCount = computed(() => {
  return displayedWorkSteps.value.filter((ws) => {
    const priority = getPriorityForStep(ws)
    return priority === PriorityEnum.IMMEDIATE
  }).length
})

function handleUserChange(userId: string) {
  selectedUserId.value = userId
  if (userId) {
    // Update current user if needed
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      setCurrentUser(user)
    }
  }
}

function handleWorkStepSelect(workStep: WorkStep) {
  handleView(workStep.id)
}

function getAssignedUserName(userId: string): string {
  return assignedUsersMap.value.get(userId) || userId
}

function getPriorityForStep(workStep: WorkStep): Priority {
  // Use manual priority if set, otherwise use stored priority
  return workStep.manualPriority || workStep.priority
}

function getPriorityLabel(priority: Priority): string {
  const labels = {
    [PriorityEnum.IMMEDIATE]: 'Sofort',
    [PriorityEnum.MEDIUM_TERM]: 'Mittelfristig',
    [PriorityEnum.LONG_TERM]: 'Langfristig',
  }
  return labels[priority] || priority
}

function isUrgentStep(workStep: WorkStep): boolean {
  const priority = getPriorityForStep(workStep)
  return priority === PriorityEnum.IMMEDIATE
}

function isDeadlineApproachingStep(workStep: WorkStep): boolean {
  // Check if deadline is approaching based on workflow deadline
  const workflow = workflows.value.find((w) => w.id === workStep.workflowId)
  if (!workflow || !workflow.deadline) return false
  
  const now = new Date()
  const deadline = new Date(workflow.deadline)
  const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursUntilDeadline <= 24 && hoursUntilDeadline > 0
}

function getWorkflowName(workflowId: string): string {
  const workflow = workflows.value.find((w) => w.id === workflowId)
  return workflow?.name || 'Unknown'
}

async function handleComplete(workStepId: string) {
  if (confirm('Mark this work step as completed?')) {
    try {
      // completeWorkStep updates the store directly, Vue reactivity handles UI updates
      // No need to reload - the board will update in real-time
      await completeWorkStep(workStepId)
    } catch (err) {
      console.error('Failed to complete work step:', err)
      alert('Failed to complete work step. Please try again.')
    }
  }
}

function handleView(workStepId: string) {
  // Navigate to work step detail view
  console.log('View work step:', workStepId)
}

async function handleStatusChange(workStepId: string, newStatus: TaskStatus) {
  try {
    // Update status via API
    const updatedStep = await updateWorkStep(workStepId, {
      status: newStatus,
      ...(newStatus === TaskStatusEnum.COMPLETED && { completedAt: new Date().toISOString() }),
    })
    
    // Store is already updated by updateWorkStep, Vue reactivity will update UI automatically
    // No need to reload - the board will update in real-time
    
    // If status changed to COMPLETED, trigger automatic next step assignment
    if (newStatus === TaskStatusEnum.COMPLETED) {
      // Use completeWorkStep to trigger full workflow logic (next step assignment, notifications)
      // This will also update the store, so UI updates automatically
      await completeWorkStep(workStepId)
    }
  } catch (err) {
    console.error('Failed to update work step status:', err)
    alert('Failed to update status. Please try again.')
  }
}
</script>

<style scoped>
.actor-dashboard {
  padding: 1rem;
  width: 100%;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .actor-dashboard {
    padding: 2rem 3rem;
  }
}

@media (min-width: 1440px) {
  .actor-dashboard {
    padding: 3rem 4rem;
    max-width: 1800px;
  }
}

.actor-dashboard__header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .actor-dashboard__header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
}

.actor-dashboard__header h1 {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .actor-dashboard__header h1 {
    font-size: var(--text-3xl);
  }
}

.actor-dashboard__user-info {
  color: #666;
}

.actor-dashboard__loading,
.actor-dashboard__error {
  padding: 2rem;
  text-align: center;
}

.actor-dashboard__error {
  color: #f44336;
}

.actor-dashboard__user-selector {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-light);
}

.actor-dashboard__view-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.view-btn-icon {
  margin-right: 0.5rem;
}

.view-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-base);
  font-weight: var(--font-medium);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  box-shadow: var(--shadow-sm);
}

.view-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.view-btn--active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  font-weight: var(--font-semibold);
}

.actor-dashboard__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-light);
}

@media (max-width: 768px) {
  .actor-dashboard__summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.875rem;
  color: #666;
}

.summary-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.summary-item--urgent .summary-value {
  color: var(--color-priority-immediate);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.actor-dashboard__empty {
  padding: 3rem;
  text-align: center;
  color: #888;
}

.actor-dashboard__board {
  width: 100%;
  overflow-x: auto;
}

.actor-dashboard__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .actor-dashboard__cards {
    grid-template-columns: 1fr;
  }
}

.workstep-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  display: block;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .workstep-table {
    font-size: 0.875rem;
  }

  .workstep-table th,
  .workstep-table td {
    padding: 0.75rem 0.5rem;
  }

  .workstep-table th:nth-child(3),
  .workstep-table td:nth-child(3),
  .workstep-table th:nth-child(4),
  .workstep-table td:nth-child(4) {
    display: none; /* Hide duration and status on mobile */
  }
}

.workstep-table thead {
  background: #f5f5f5;
}

.workstep-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
}

.workstep-table td {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

.workstep-table tbody tr:hover {
  background: #f9f9f9;
}

.row--urgent {
  background: #ffebee !important;
}

.row--completed {
  opacity: 0.7;
}

.priority-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority--immediate {
  background: #ffebee;
  color: #c62828;
}

.priority--medium_term {
  background: #fff3e0;
  color: #e65100;
}

.priority--long_term {
  background: #e3f2fd;
  color: #1565c0;
}

.status--pending {
  background: #fff3e0;
  color: #e65100;
}

.status--in_progress {
  background: #e3f2fd;
  color: #1565c0;
}

.status--completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:hover {
  background: #f5f5f5;
}

.btn--small {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.btn--primary {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.btn--primary:hover {
  background: #1976d2;
}
</style>

