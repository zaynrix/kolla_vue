<!--
  Actor Dashboard View
  Shows assigned work steps for the current actor with prioritization
  Demonstrates Usability I & II: Multiple views and automatic updates
-->
<template>
  <div class="actor-dashboard">
the     <!-- Header Section -->
    <div class="actor-dashboard__header">
      <div class="header-content">
        <div class="header-title-section">
          <h1 class="page-title">My Work Steps</h1>
          <p class="page-subtitle">Manage and track your assigned tasks</p>
        </div>
        <div v-if="!loading && !error && displayedWorkSteps.length > 0" class="header-stats">
          <div class="stat-badge">
            <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span class="stat-value">{{ displayedWorkSteps.length }}</span>
            <span class="stat-label">Total Tasks</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="actor-dashboard__loading">
      <div class="loading-content">
        <svg class="loading-spinner" fill="none" viewBox="0 0 24 24">
          <circle class="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
          <path class="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Loading assignments...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="actor-dashboard__error">
      <div class="error-content">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="error-text">
          <h3>Error Loading Assignments</h3>
          <p>{{ error.message }}</p>
        </div>
        <button @click="retryLoad" class="btn btn--primary">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Retry</span>
        </button>
      </div>
    </div>

    <div v-else class="actor-dashboard__content">
      <!-- View Selector - Prominently placed at top -->
      <div class="actor-dashboard__view-selector-wrapper">
        <div class="view-selector-label">View Mode:</div>
        <div class="actor-dashboard__view-selector">
          <button
            :class="['view-btn', { 'view-btn--active': viewMode === 'board' }]"
            @click="viewMode = 'board'"
            title="Kanban Board View"
          >
            <svg class="view-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
            </svg>
            <span>Board</span>
          </button>
          <button
            :class="['view-btn', { 'view-btn--active': viewMode === 'cards' }]"
            @click="viewMode = 'cards'"
            title="Card Grid View"
          >
            <svg class="view-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <span>Cards</span>
          </button>
          <button
            :class="['view-btn', { 'view-btn--active': viewMode === 'table' }]"
            @click="viewMode = 'table'"
            title="Table View"
          >
            <svg class="view-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <span>Table</span>
          </button>
        </div>
      </div>

      <!-- Top Controls Section -->
      <div class="actor-dashboard__top-controls">
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
      </div>

      <!-- Admin Controls Section -->
      <div v-if="isAdmin" class="actor-dashboard__admin-section">
        <!-- User Selector - Only show for admin users -->
        <div class="actor-dashboard__user-selector">
          <div class="user-selector-header">
            <label for="user-select" class="selector-label">Filter by User:</label>
            <select
              id="user-select"
              v-model="selectedUserId"
              class="user-select-dropdown"
            >
              <option value="">All Assignments (All Users)</option>
              <option
                v-for="user in availableUsers"
                :key="user.id"
                :value="user.id"
              >
                {{ user.username }}
              </option>
            </select>
          </div>
        </div>

        <!-- Admin Actions - Create Work Step Button -->
        <div class="actor-dashboard__admin-actions">
          <select v-model="selectedWorkflowId" class="workflow-select" v-if="workflows.length > 0">
            <option value="">Select Workflow</option>
            <option v-for="workflow in workflows" :key="workflow.id" :value="workflow.id">
              {{ workflow.name }}
            </option>
          </select>
          <button 
            @click="showCreateModal = true" 
            class="btn btn--primary"
            :disabled="!selectedWorkflowId && workflows.length > 0"
          >
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Create New Work Step</span>
          </button>
        </div>
      </div>

      <!-- Charts Section -->
      <div v-if="displayedWorkSteps.length > 0" class="charts-section">
        <div class="charts-grid">
          <CompletionChart
            :total="displayedWorkSteps.length"
            :completed="completedCount"
            :in-progress="inProgressCount"
            :pending="pendingCount"
          />
          <PriorityChart
            :short-term="shortTermCount"
            :mid-term="midTermCount"
            :long-term="longTermCount"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="displayedWorkSteps.length === 0" class="actor-dashboard__empty">
        <div class="empty-content">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="empty-title">
            <span v-if="isAdmin && !selectedUserId">No Assignments Found</span>
            <span v-else-if="isAdmin && selectedUserId">No Assignments for Selected User</span>
            <span v-else>No Assignments Yet</span>
          </h3>
          <p class="empty-message">
            <span v-if="isAdmin && !selectedUserId">No assignments found across all users.</span>
            <span v-else-if="isAdmin && selectedUserId">No assignments found for the selected user.</span>
            <span v-else>You don't have any assigned tasks at the moment.</span>
          </p>
          <p v-if="!isAdmin" class="empty-hint">
            Assignments will appear here when an admin assigns tasks to you.
          </p>
        </div>
      </div>

      <!-- Board View - Trello/Jira Style -->
      <div v-else-if="viewMode === 'board'" class="actor-dashboard__board">
        <WorkStepBoard
          :work-steps="displayedWorkSteps"
          :assigned-users="assignedUsersMap"
          :is-admin="isAdmin"
          :workflows="workflows.map(w => ({ id: w.id, name: w.name, deadline: w.deadline }))"
          @select="handleWorkStepSelect"
          @complete="handleComplete"
          @status-change="handleStatusChange"
          @edit="handleEdit"
          @reassign="handleReassign"
          @delete="handleDelete"
          @assign-workflow="handleAssignWorkflow"
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
                :workflow-deadline="getWorkflowDeadline(workStep.workflowId)"
                @complete="handleComplete"
                @view="handleView"
              >
                <template v-if="isAdmin" #actions="{ workStep }">
                  <button
                    @click.stop="handleViewDetails(workStep.id)"
                    class="btn btn--small btn--secondary"
                    title="View Details"
                  >
                    View
                  </button>
                  <button
                    @click.stop="handleEdit(workStep.id)"
                    class="btn btn--small btn--secondary"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    @click.stop="handleReassign(workStep.id)"
                    class="btn btn--small btn--secondary"
                    title="Reassign"
                  >
                    Reassign
                  </button>
                  <button
                    @click.stop="handleDelete(workStep.id)"
                    class="btn btn--small btn--danger"
                    title="Delete"
                  >
                    Delete
                  </button>
                  <button
                    v-if="workStep.status !== 'COMPLETED'"
                    @click.stop="handleComplete(workStep.id)"
                    class="btn btn--small btn--primary"
                    title="Complete"
                  >
                    Complete
                  </button>
                </template>
              </WorkStepCard>
      </div>

      <!-- Table View - Usability I: Alternative representation -->
      <div v-else-if="viewMode === 'table'" class="actor-dashboard__table">
        <table class="workstep-table">
          <thead>
            <tr>
              <th class="col-title">Title</th>
              <th class="col-priority">Priority</th>
              <th class="col-duration">Duration</th>
              <th class="col-status">Status</th>
              <th class="col-workflow">Workflow</th>
              <th class="col-actions">Actions</th>
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
              @click="handleView(workStep.id)"
            >
              <td class="col-title">
                <div class="workstep-title-cell">
                  <div class="workstep-title">{{ workStep.title }}</div>
                  <div v-if="workStep.description" class="workstep-description">{{ workStep.description }}</div>
                </div>
              </td>
              <td class="col-priority">
                <span :class="['priority-badge', `priority--${getPriorityForStep(workStep).toLowerCase().replace('_', '-')}`]">
                  {{ getPriorityLabel(getPriorityForStep(workStep)) }}
                </span>
              </td>
              <td class="col-duration">{{ workStep.duration }}h</td>
              <td class="col-status">
                <span :class="['status-badge', `status--${workStep.status.toLowerCase().replace('_', '-')}`]">
                  {{ workStep.status.replace('_', ' ') }}
                </span>
              </td>
              <td class="col-workflow">
                <span class="workflow-name">{{ getWorkflowName(workStep.workflowId) }}</span>
              </td>
              <td class="col-actions" @click.stop>
                <div class="action-buttons">
                  <button
                    v-if="isAdmin"
                    @click="handleViewDetails(workStep.id)"
                    class="btn btn--small btn--secondary"
                    title="View Details"
                  >
                    👁️
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="handleEdit(workStep.id)"
                    class="btn btn--small btn--secondary"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="handleReassign(workStep.id)"
                    class="btn btn--small btn--secondary"
                    title="Reassign"
                  >
                    🔄
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="handleDelete(workStep.id)"
                    class="btn btn--small btn--danger"
                    title="Delete"
                  >
                    🗑️
                  </button>
                  <button
                    v-if="workStep.status !== 'COMPLETED'"
                    @click="handleComplete(workStep.id)"
                    class="btn btn--small btn--primary"
                  >
                    Complete
                  </button>
                  <span v-else class="text-muted">Completed</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <!-- Work Step Detail Modal -->
    <WorkStepDetailModal
      :show="showDetailModal"
      :work-step="selectedWorkStep"
      :assigned-users-map="assignedUsersMap"
      :workflow-name="getWorkflowName(selectedWorkStep?.workflowId || '')"
      :workflow-deadline="selectedWorkStep ? getWorkflowDeadline(selectedWorkStep.workflowId) : undefined"
      :is-admin="isAdmin"
      @close="showDetailModal = false"
      @edit="handleEditFromModal"
      @reassign="handleReassignFromModal"
      @delete="handleDeleteFromModal"
    />

    <!-- Reassign Modal -->
    <ReassignWorkStepModal
      :show="showReassignModal"
      :work-step="selectedWorkStep"
      @close="showReassignModal = false"
      @reassigned="handleReassigned"
    />

    <!-- Edit Modal -->
    <div v-if="showEditModal && selectedWorkStep" class="modal-overlay-edit" @click.self="showEditModal = false">
      <div class="modal-content-edit">
        <EditWorkStepForm
          :show-form="true"
          :work-step="selectedWorkStep"
          @close="showEditModal = false"
          @updated="handleUpdated"
        />
      </div>
    </div>

    <!-- Create Work Step Modal -->
    <div v-if="showCreateModal" class="modal-overlay-create" @click.self="showCreateModal = false">
      <div class="modal-content-create">
        <CreateWorkStepForm
          :show-form="true"
          :workflow-id="selectedWorkflowId || (workflows.length > 0 && workflows[0]?.id ? workflows[0].id : '')"
          @close="showCreateModal = false"
          @created="handleCreated"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorkStep } from '@/composables/useWorkStep'
import { useWorkflow } from '@/composables/useWorkflow'
import { useUser } from '@/composables/useUser'
import { useActor } from '@/composables/useActor'
import { usePriority } from '@/composables/usePriority'
import { useUserStore } from '@/stores/user'
import { useWorkStepStore } from '@/stores/workStep'
import { useApi } from '@/composables/useApi'
import { useAuthorization } from '@/composables/useAuthorization'
import WorkStepCard from '@/components/presenters/WorkStepCard.vue'
import WorkStepBoard from '@/components/presenters/WorkStepBoard.vue'
import UserSelector from '@/components/presenters/UserSelector.vue'
import CompletionChart from '@/components/presenters/CompletionChart.vue'
import PriorityChart from '@/components/presenters/PriorityChart.vue'
import WorkStepDetailModal from '@/components/containers/WorkStepDetailModal.vue'
import ReassignWorkStepModal from '@/components/containers/ReassignWorkStepModal.vue'
import EditWorkStepForm from '@/components/containers/EditWorkStepForm.vue'
import CreateWorkStepForm from '@/components/containers/CreateWorkStepForm.vue'
import type { WorkStep, Priority, TaskStatus } from '@/types/domain'
import { Priority as PriorityEnum, TaskStatus as TaskStatusEnum } from '@/types/domain'

type ViewMode = 'board' | 'cards' | 'table'

const viewMode = ref<ViewMode>('board')
const selectedUserId = ref<string>('')
const { myWorkSteps, prioritizedWorkSteps, loading, error, loadMyWorkSteps, completeWorkStep, loadWorkSteps, updateWorkStep, createWorkStep, deleteWorkStep } = useWorkStep()
const { workflows, loadWorkflows } = useWorkflow()
const { currentUser, availableUsers: viewModelUsers, setCurrentUser } = useUser()
const { actors, loadActors } = useActor()
const userStore = useUserStore()
const { canAccessWorkStep } = useAuthorization()

// Modal states
const showDetailModal = ref(false)
const showReassignModal = ref(false)
const showEditModal = ref(false)
const showCreateModal = ref(false)
const selectedWorkStep = ref<WorkStep | null>(null)
const selectedWorkflowId = ref<string>('')

// Check if current user is admin (has role with isAdmin flag)
const isAdmin = computed(() => userStore.isAdmin)

// Use ViewModel users, fallback to actors if needed
const availableUsers = computed(() => {
  if (viewModelUsers.value.length > 0) return viewModelUsers.value
  // Map actors to users format
  return actors.value.map((actor) => ({
    id: actor.guid,
    username: actor.displayName,
    email: `${actor.displayName}@example.com`,
    role: actor.role?.isAdmin ? 'ADMIN' : 'TEAM_MEMBER',
    tenantId: undefined,
  }))
})

// Get all work steps or filtered by selected user (supports multiple assignments)
// Non-admin users only see their own assignments
// Admin users see ALL assignments when no user is selected, or filtered when a user is selected
const displayedWorkSteps = computed(() => {
  // For non-admin users, always filter by current user
  if (!isAdmin.value) {
    const userIdToFilter = currentUser.value?.id
    if (userIdToFilter) {
      return prioritizedWorkSteps.value.filter((ws) => {
        if (!ws.assignedTo) return false
        if (Array.isArray(ws.assignedTo)) {
          return ws.assignedTo.includes(userIdToFilter)
        }
        return ws.assignedTo === userIdToFilter
      })
    }
    return []
  }
  
  // For admin users: if no user selected, show ALL assignments
  // If user selected, filter by that user
  const userIdToFilter = selectedUserId.value
  
  if (userIdToFilter) {
    return prioritizedWorkSteps.value.filter((ws) => {
      if (!ws.assignedTo) return false
      if (Array.isArray(ws.assignedTo)) {
        return ws.assignedTo.includes(userIdToFilter)
      }
      return ws.assignedTo === userIdToFilter
    })
  }
  
  // Admin with no user selected: show ALL assignments
  return prioritizedWorkSteps.value
})

// Create map of user IDs to usernames
const assignedUsersMap = computed(() => {
  const map = new Map<string, string>()
  actors.value.forEach((actor) => {
    map.set(actor.guid, actor.displayName)
  })
  return map
})

// Load actors and set current user
onMounted(async () => {
  await loadActors()
  
  // Set current user if not set (use first actor as default)
  if (!currentUser.value && actors.value.length > 0) {
    const firstActor = actors.value[0]
    if (firstActor) {
      setCurrentUser({
        id: firstActor.guid,
        username: firstActor.displayName,
        email: `${firstActor.displayName}@example.com`,
        role: (firstActor.role?.isAdmin ? 'ADMIN' : 'TEAM_MEMBER') as any,
        tenantId: undefined,
      })
      selectedUserId.value = firstActor.guid
    }
  } else if (currentUser.value) {
    selectedUserId.value = currentUser.value.id
  }
  
  await loadWorkflows()
  
  // Admin users can see all work steps, non-admin only see their own
  if (isAdmin.value) {
    await loadWorkSteps() // Load all work steps for admin
  } else {
    // Non-admin users only see their own assignments
    if (currentUser.value) {
      selectedUserId.value = currentUser.value.id
      await loadMyWorkSteps() // Load only current user's assignments
    }
  }
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
    return priority === PriorityEnum.SHORT_TERM
  }).length
})

const completedCount = computed(() => {
  return displayedWorkSteps.value.filter((ws) => ws.status === 'COMPLETED').length
})

const shortTermCount = computed(() => {
  return displayedWorkSteps.value.filter((ws) => {
    const priority = getPriorityForStep(ws)
    return priority === PriorityEnum.SHORT_TERM
  }).length
})

const midTermCount = computed(() => {
  return displayedWorkSteps.value.filter((ws) => {
    const priority = getPriorityForStep(ws)
    return priority === PriorityEnum.MID_TERM
  }).length
})

const longTermCount = computed(() => {
  return displayedWorkSteps.value.filter((ws) => {
    const priority = getPriorityForStep(ws)
    return priority === PriorityEnum.LONG_TERM
  }).length
})

async function retryLoad() {
  if (isAdmin.value) {
    await loadWorkSteps()
  } else {
    await loadMyWorkSteps()
  }
}

// Note: handleUserChange removed - filtering is handled automatically by v-model
// on selectedUserId, which triggers the displayedWorkSteps computed property
// Admin stays as admin, just filters the view to show selected actor's assignments

function handleWorkStepSelect(workStep: WorkStep) {
  // Check authorization for non-admin users
  if (!isAdmin.value) {
    const authResult = canAccessWorkStep(workStep)
    if (!authResult.allowed) {
      alert(`Access denied: ${authResult.reason || 'You do not have permission to access this work step.'}`)
      return
    }
  }
  
  if (isAdmin.value) {
    // For admins, show details modal when clicking on board card
    handleViewDetails(workStep.id)
  } else {
    handleView(workStep.id)
  }
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
    [PriorityEnum.SHORT_TERM]: 'Short Term',
    [PriorityEnum.MID_TERM]: 'Mid Term',
    [PriorityEnum.LONG_TERM]: 'Long Term',
  }
  return labels[priority] || priority
}

function isUrgentStep(workStep: WorkStep): boolean {
  const priority = getPriorityForStep(workStep)
  return priority === PriorityEnum.SHORT_TERM
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

function getWorkflowDeadline(workflowId: string): Date | undefined {
  const workflow = workflows.value.find((w) => w.id === workflowId)
  return workflow?.deadline
}

async function handleComplete(workStepId: string) {
  const workStep = prioritizedWorkSteps.value.find(ws => ws.id === workStepId)
  if (!workStep) {
    alert('Work step not found')
    return
  }
  
  // Check authorization for non-admin users
  if (!isAdmin.value) {
    const authResult = canAccessWorkStep(workStep)
    if (!authResult.allowed) {
      alert(`Access denied: ${authResult.reason || 'You do not have permission to complete this work step.'}`)
      return
    }
  }
  
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
  handleViewDetails(workStepId)
}

function handleViewDetails(workStepId: string) {
  const workStep = prioritizedWorkSteps.value.find(ws => ws.id === workStepId)
  if (!workStep) {
    alert('Work step not found')
    return
  }
  
  // Check authorization for non-admin users
  if (!isAdmin.value) {
    const authResult = canAccessWorkStep(workStep)
    if (!authResult.allowed) {
      alert(`Access denied: ${authResult.reason || 'You do not have permission to view this work step.'}`)
      return
    }
  }
  
  selectedWorkStep.value = workStep
  showDetailModal.value = true
}

function handleEdit(workStepId: string) {
  const workStep = prioritizedWorkSteps.value.find(ws => ws.id === workStepId)
  if (workStep) {
    selectedWorkStep.value = workStep
    showEditModal.value = true
  }
}

function handleReassign(workStepId: string) {
  // Try to find work step in displayed work steps first, then in all work steps
  let workStep = displayedWorkSteps.value.find(ws => ws.id === workStepId)
  if (!workStep) {
    workStep = prioritizedWorkSteps.value.find(ws => ws.id === workStepId)
  }
  if (!workStep) {
    // If still not found, try in myWorkSteps (for non-admin users)
    workStep = myWorkSteps.value.find(ws => ws.id === workStepId)
  }
  
  if (workStep) {
    selectedWorkStep.value = workStep
    showReassignModal.value = true
  } else {
    console.error('Work step not found for reassign:', workStepId)
    alert('Work step not found. Please refresh the page and try again.')
  }
}

async function handleReassigned(workStepId: string) {
  // Reload work steps to reflect changes
  if (isAdmin.value) {
    await loadWorkSteps()
  } else {
    await loadMyWorkSteps()
  }
  // Also reload workflows to ensure consistency
  await loadWorkflows()
}

function handleUpdated(workStepId: string) {
  // Reload work steps to reflect changes
  if (isAdmin.value) {
    loadWorkSteps()
  } else {
    loadMyWorkSteps()
  }
}

async function handleCreated(workStepId: string) {
  // Reload work steps to show new work step
  if (isAdmin.value) {
    await loadWorkSteps()
  } else {
    await loadMyWorkSteps()
  }
  showCreateModal.value = false
  selectedWorkflowId.value = workflows.value.length > 0 && workflows.value[0] ? workflows.value[0].id : ''
}

async function handleDelete(workStepId: string) {
  const workStep = prioritizedWorkSteps.value.find(ws => ws.id === workStepId)
  if (!workStep) {
    console.error('Work step not found:', workStepId)
    return
  }

  if (!confirm(`Are you sure you want to delete "${workStep.title}"? This action cannot be undone.`)) {
    return
  }

  try {
    console.log('Deleting work step:', workStepId)
    await deleteWorkStep(workStepId)
    console.log('Work step deleted successfully')
    
    // Reload work steps to reflect changes
    if (isAdmin.value) {
      await loadWorkSteps()
    } else {
      await loadMyWorkSteps()
    }
  } catch (err) {
    console.error('Failed to delete work step:', err)
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete work step. Please try again.'
    alert(`Error: ${errorMessage}`)
  }
}

function handleEditFromModal() {
  if (selectedWorkStep.value) {
    showDetailModal.value = false
    handleEdit(selectedWorkStep.value.id)
  }
}

function handleReassignFromModal() {
  if (selectedWorkStep.value) {
    showDetailModal.value = false
    handleReassign(selectedWorkStep.value.id)
  }
}

function handleDeleteFromModal() {
  if (selectedWorkStep.value) {
    showDetailModal.value = false
    handleDelete(selectedWorkStep.value.id)
  }
}

async function handleStatusChange(workStepId: string, newStatus: TaskStatus) {
  const workStep = prioritizedWorkSteps.value.find(ws => ws.id === workStepId)
  if (!workStep) {
    console.error('Work step not found:', workStepId)
    return
  }
  
  // Check authorization for non-admin users
  if (!isAdmin.value) {
    const authResult = canAccessWorkStep(workStep)
    if (!authResult.allowed) {
      alert(`Access denied: ${authResult.reason || 'You do not have permission to change the status of this work step.'}`)
      return
    }
  }
  // Get current step for potential rollback
  const workStepStore = useWorkStepStore()
  const currentStep = workStepStore.getWorkStepById(workStepId)
  
  // Don't update store optimistically here - let the board component handle it
  // This ensures only the specific card updates, not the whole list
  
  try {
    // Update status via API
    const updatedStep = await updateWorkStep(workStepId, {
      status: newStatus,
      ...(newStatus === TaskStatusEnum.COMPLETED && { completedAt: new Date().toISOString() }),
    })
    
    // Store is updated by updateWorkStep with server response
    // This will sync the optimistic update in the board component
    
    // If status changed to COMPLETED, trigger automatic next step assignment
    if (newStatus === TaskStatusEnum.COMPLETED) {
      // Use completeWorkStep to trigger full workflow logic (next step assignment, notifications)
      await completeWorkStep(workStepId)
    }
  } catch (err) {
    console.error('Failed to update work step status:', err)
    
    // Revert optimistic update on error by updating store with original
    if (currentStep) {
      workStepStore.updateWorkStep(currentStep)
    }
    
    alert('Failed to update status. Please try again.')
  }
}

async function handleAssignWorkflow(workStepId: string, workflowId: string) {
  try {
    const api = useApi()
    
    // Use the assignment API to set the parent objective (workflow)
    await api.assignment.setAssignmentParentObjective(workStepId, workflowId)
    
    // Reload work steps to reflect the change
    if (isAdmin.value) {
      await loadWorkSteps()
    } else {
      await loadMyWorkSteps()
    }
    
    alert('Work step successfully assigned to workflow!')
  } catch (err) {
    console.error('Failed to assign workflow:', err)
    const errorMessage = err instanceof Error ? err.message : 'Failed to assign workflow. Please try again.'
    alert(`Error: ${errorMessage}`)
  }
}
</script>

<style scoped>
.actor-dashboard {
  padding: var(--spacing-xl);
  width: 100%;
  margin: 0 auto;
  background: var(--color-background);
  min-height: calc(100vh - 80px);
}

@media (min-width: 768px) {
  .actor-dashboard {
    padding: var(--spacing-2xl) var(--spacing-3xl);
  }
}

@media (min-width: 1440px) {
  .actor-dashboard {
    padding: var(--spacing-3xl) var(--spacing-3xl);
    max-width: 1800px;
  }
}

/* Header Section */
.actor-dashboard__header {
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-xl);
  flex-wrap: wrap;
}

.header-title-section {
  flex: 1;
  min-width: 0;
}

.page-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  line-height: var(--leading-tight);
}

.page-subtitle {
  margin: 0;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  font-weight: var(--font-normal);
}

@media (min-width: 768px) {
  .page-title {
    font-size: var(--text-4xl);
  }
}

.header-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  border-radius: var(--radius-lg);
  color: white;
  min-width: 100px;
}

.stat-icon {
  width: 24px;
  height: 24px;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Loading State */
.actor-dashboard__loading {
  padding: var(--spacing-3xl);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

.spinner-circle {
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite;
}

.spinner-path {
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}

.loading-content p {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
}

/* Error State */
.actor-dashboard__error {
  padding: var(--spacing-3xl);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  text-align: center;
  max-width: 500px;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: var(--color-error);
}

.error-text h3 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.error-text p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--text-base);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.btn--primary {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

.btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.actor-dashboard__top-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-light);
}

@media (min-width: 1024px) {
  .actor-dashboard__top-controls {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-2xl);
    padding: var(--spacing-2xl);
  }
}

.actor-dashboard__admin-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
}

@media (min-width: 768px) {
  .actor-dashboard__admin-section {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-xl) var(--spacing-2xl);
  }
}

.actor-dashboard__user-selector {
  flex: 1;
}

.user-selector-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.selector-label {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  font-size: var(--text-base);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.selector-label::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border-radius: var(--radius-full);
}

.user-select-dropdown {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background: var(--color-surface);
  min-width: 250px;
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--color-text-primary);
}

.user-select-dropdown:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.05);
}

.user-select-dropdown:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.actor-dashboard__admin-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.workflow-select {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background: var(--color-surface);
  min-width: 200px;
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--color-text-primary);
}

.workflow-select:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.05);
}

.workflow-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-overlay-create {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content-create {
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-overlay-edit {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content-edit {
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}


.actor-dashboard__view-selector-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-light);
  flex-wrap: wrap;
}

.view-selector-label {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  font-size: var(--text-base);
  white-space: nowrap;
}

.actor-dashboard__view-selector {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  flex: 1;
  justify-content: flex-start;
}

.view-btn-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.view-btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-base);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  color: var(--color-text-primary);
  min-width: 120px;
  justify-content: center;
}

.view-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.view-btn:hover::before {
  left: 100%;
}

.view-btn:hover {
  background: linear-gradient(135deg, var(--color-surface-hover) 0%, var(--color-surface) 100%);
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  color: var(--color-primary);
}

.view-btn:hover .view-btn-icon {
  transform: scale(1.1);
}

.view-btn--active {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  box-shadow: 
    0 4px 12px rgba(37, 99, 235, 0.3),
    0 2px 4px rgba(37, 99, 235, 0.2);
  font-weight: var(--font-semibold);
  transform: translateY(-1px);
}

.view-btn--active::before {
  display: none;
}

.view-btn--active:hover {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  transform: translateY(-2px);
  box-shadow: 
    0 6px 16px rgba(37, 99, 235, 0.4),
    0 4px 8px rgba(37, 99, 235, 0.3);
}

.view-btn--active .view-btn-icon {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .actor-dashboard__view-selector-wrapper {
    flex-direction: column;
    align-items: stretch;
    padding: var(--spacing-md);
  }

  .view-selector-label {
    text-align: center;
    margin-bottom: var(--spacing-sm);
  }

  .actor-dashboard__view-selector {
    justify-content: center;
  }

  .view-btn {
    flex: 1;
    min-width: 100px;
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--text-sm);
  }

  .view-btn-icon {
    width: 16px;
    height: 16px;
  }
}

.actor-dashboard__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  flex: 1;
}

@media (max-width: 768px) {
  .actor-dashboard__summary {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-base);
}

.summary-item:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.summary-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  line-height: 1;
}

.summary-item--urgent .summary-value {
  color: var(--color-error);
}

.summary-item--urgent {
  background: linear-gradient(135deg, var(--color-error-light) 0%, rgba(239, 68, 68, 0.05) 100%);
  border-color: rgba(239, 68, 68, 0.2);
}

/* Empty State */
.actor-dashboard__empty {
  padding: var(--spacing-3xl);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  text-align: center;
  max-width: 500px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: var(--color-text-tertiary);
  opacity: 0.5;
}

.empty-title {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.empty-message {
  margin: 0;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.empty-hint {
  margin: var(--spacing-md) 0 0 0;
  padding: var(--spacing-md);
  background: var(--color-info-light);
  color: var(--color-info);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.actor-dashboard__board {
  width: 100%;
  overflow-x: auto;
  padding: var(--spacing-lg) 0;
  margin-top: var(--spacing-xl);
  background: var(--color-background);
  border-radius: var(--radius-xl);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04);
}

.actor-dashboard__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
  margin-top: var(--spacing-xl);
  background: var(--color-background);
  border-radius: var(--radius-xl);
}

@media (min-width: 1400px) {
  .actor-dashboard__cards {
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    gap: var(--spacing-2xl);
  }
}

@media (min-width: 1200px) and (max-width: 1399px) {
  .actor-dashboard__cards {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: var(--spacing-xl);
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .actor-dashboard__cards {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .actor-dashboard__cards {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }
}

.actor-dashboard__table {
  width: 100%;
  margin-top: var(--spacing-xl);
  overflow-x: auto;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-lg);
}

.workstep-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.workstep-table thead {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
  border-bottom: 2px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.workstep-table th {
  padding: var(--spacing-lg) var(--spacing-xl);
  text-align: left;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.workstep-table td {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
  vertical-align: middle;
  background: var(--color-surface);
  transition: all var(--transition-base);
}

.workstep-table tbody tr {
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
}

.workstep-table tbody tr::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: transparent;
  transition: background var(--transition-base);
}

.workstep-table tbody tr:hover {
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.03) 0%, transparent 100%);
}

.workstep-table tbody tr:hover::before {
  background: var(--color-primary);
}

.workstep-table tbody tr:hover td {
  background: transparent;
}

.workstep-table tbody tr:last-child td {
  border-bottom: none;
}

.row--urgent {
  background-color: #fff5f5;
}

.row--urgent:hover {
  background-color: #ffe5e5;
}

.row--completed {
  opacity: 0.6;
}

.row--completed:hover {
  opacity: 0.8;
}

/* Title Column */
.col-title {
  min-width: 200px;
  max-width: 350px;
}

.workstep-title-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.workstep-title {
  font-weight: 600;
  color: var(--color-text-primary, #1a1a1a);
  font-size: 0.9375rem;
  line-height: 1.4;
}

.workstep-description {
  font-size: 0.8125rem;
  color: var(--color-text-secondary, #4a5568);
  line-height: 1.5;
  margin: 0;
  margin-top: 0.25rem;
}

/* Priority Column */
.col-priority {
  min-width: 100px;
}

.col-workflow {
  color: var(--color-text-primary, #1a1a1a);
}

.workflow-name {
  color: var(--color-text-primary, #1a1a1a);
}

.priority-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.priority--short-term {
  background-color: #fee;
  color: #c33;
}

.priority--mid-term {
  background-color: #fff4e6;
  color: #d97706;
}

.priority--long-term {
  background-color: #e6f2ff;
  color: #2563eb;
}

/* Duration Column */
.col-duration {
  min-width: 70px;
  text-align: center;
  color: #495057;
  font-weight: 500;
}

/* Status Column */
.col-status {
  min-width: 110px;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status--pending {
  background-color: #fff4e6;
  color: #d97706;
}

.status--in-progress {
  background-color: #e6f2ff;
  color: #2563eb;
}

.status--completed {
  background-color: #e6f9e6;
  color: #16a34a;
}

.status--blocked {
  background-color: #fee;
  color: #c33;
}

/* Workflow Column */
.col-workflow {
  min-width: 120px;
  color: #495057;
  font-size: 0.875rem;
}

/* Actions Column */
.col-actions {
  min-width: 200px;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn--secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn--secondary:hover {
  background: var(--color-surface-hover);
}

.text-muted {
  color: #6c757d;
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .workstep-table {
    font-size: 0.875rem;
  }

  .workstep-table th,
  .workstep-table td {
    padding: 0.75rem 0.5rem;
  }

  .col-duration,
  .col-workflow {
    display: none;
  }

  .col-title {
    min-width: 180px;
    max-width: 250px;
  }
}

@media (max-width: 480px) {
  .workstep-table th,
  .workstep-table td {
    padding: 0.625rem 0.375rem;
    font-size: 0.8125rem;
  }

  .col-status {
    display: none;
  }

  .priority-badge,
  .status-badge {
    padding: 0.2rem 0.5rem;
    font-size: 0.6875rem;
  }
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

.btn--danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.btn--danger:hover {
  background: #c82333;
  border-color: #bd2130;
}

.charts-section {
  margin-bottom: var(--spacing-2xl);
  margin-top: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-light);
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  align-items: stretch;
}

@media (max-width: 768px) {
  .charts-section {
    padding: var(--spacing-lg);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
}

@media (min-width: 1440px) {
  .charts-grid {
    gap: var(--spacing-3xl);
  }
}
</style>

