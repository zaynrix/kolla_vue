<!--
  EditWorkStepForm - Container Component
  Form to edit existing work step details
-->
<template>
  <div v-if="showForm" class="edit-workstep-form">
    <div class="form-header">
      <h3>Edit Work Step</h3>
      <button @click="$emit('close')" class="btn-close">×</button>
    </div>

    <form @submit.prevent="handleSubmit" class="form-content">
      <div class="form-group">
        <label for="step-title" class="form-label">Title *</label>
        <input
          id="step-title"
          v-model="formData.title"
          type="text"
          class="form-input"
          required
          placeholder="Enter work step title"
        />
      </div>

      <div class="form-group">
        <label for="step-description" class="form-label">Description</label>
        <textarea
          id="step-description"
          v-model="formData.description"
          class="form-textarea"
          rows="3"
          placeholder="Enter work step description"
        />
      </div>

      <div class="form-group">
        <label for="step-status" class="form-label">Status *</label>
        <select
          id="step-status"
          v-model="formData.status"
          class="form-select"
          required
        >
          <option :value="TaskStatus.PENDING">To Do</option>
          <option :value="TaskStatus.IN_PROGRESS">In Progress</option>
          <option :value="TaskStatus.COMPLETED">Done</option>
        </select>
      </div>


      <div class="form-row">
        <div class="form-group">
          <label for="step-start-date" class="form-label">Start Date *</label>
          <div class="date-input-wrapper">
            <svg class="date-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              id="step-start-date"
              v-model="formData.startDate"
              type="datetime-local"
              class="form-input date-input"
              required
            />
          </div>
          <small class="form-hint">When the assignment should start</small>
        </div>

        <div class="form-group">
          <label for="step-deadline-date" class="form-label">Deadline Date *</label>
          <div class="date-input-wrapper">
            <svg class="date-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <input
              id="step-deadline-date"
              v-model="formData.deadlineDate"
              type="datetime-local"
              class="form-input date-input"
              :min="formData.startDate || undefined"
              :max="maxDeadlineDate"
              required
            />
          </div>
          <small class="form-hint">
            Must be after start date
            <span v-if="workflow?.deadline">
              and before workflow deadline ({{ new Date(workflow.deadline).toLocaleDateString() }})
            </span>
          </small>
        </div>
      </div>

      <div v-if="calculatedDuration !== null" class="form-group">
        <div class="duration-display">
          <label class="form-label">Duration</label>
          <div class="duration-value">
            <strong>{{ calculatedDuration }} hours</strong>
            <small class="form-hint">Time from start to deadline (calculated automatically)</small>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="step-assignees" class="form-label">Assign To Users</label>
        
        <!-- Role Filter Dropdown -->
        <div class="form-group form-group--inline">
          <label for="role-filter" class="form-label form-label--small">Filter by Role</label>
          <select
            id="role-filter"
            v-model="selectedRoleGuid"
            @change="handleRoleFilterChange"
            class="form-select"
          >
            <option value="">All Users</option>
            <option value="no-role">Users without Role</option>
            <option
              v-for="role in roles"
              :key="role.guid"
              :value="role.guid"
            >
              {{ role.displayName }}
            </option>
          </select>
        </div>
        
        <div class="assignees-container">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="assignee-checkbox"
          >
            <input
              :id="`assignee-${user.id}`"
              type="checkbox"
              :value="user.id"
              v-model="selectedAssignees"
              class="checkbox-input"
            />
            <label :for="`assignee-${user.id}`" class="checkbox-label">
              <span class="user-name">{{ user.username }}</span>
              <span class="user-role" v-if="user.role && user.role !== 'No Role'">
                <span class="role-badge">{{ user.role }}</span>
              </span>
              <span class="user-role" v-else>
                <span class="role-badge role-badge--no-role">No Role</span>
              </span>
            </label>
          </div>
          <p v-if="filteredUsers.length === 0" class="no-users">
            <span v-if="selectedRoleGuid">No users found with the selected role.</span>
            <span v-else>No users available.</span>
          </p>
        </div>
      </div>

      <div v-if="error" class="form-error">
        {{ error }}
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('close')" class="btn btn--secondary">
          Cancel
        </button>
        <button type="submit" :disabled="loading" class="btn btn--primary">
          <span v-if="loading">Updating...</span>
          <span v-else>Update Work Step</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useWorkStep } from '@/composables/useWorkStep'
import { useActor } from '@/composables/useActor'
import { useRole } from '@/composables/useRole'
import { useAuthorization } from '@/composables/useAuthorization'
import { useWorkStepStore } from '@/stores/workStep'
import { useWorkflowStore } from '@/stores/workflow'
import type { UpdateWorkStepRequest } from '@/types/api'
import { Role, TaskStatus } from '@/types/domain'
import type { WorkStep } from '@/types/domain'

interface Props {
  showForm?: boolean
  workStep: WorkStep | null
}

const props = withDefaults(defineProps<Props>(), {
  showForm: false,
  workStep: null,
})

const emit = defineEmits<{
  close: []
  updated: [workStepId: string]
}>()

const { updateWorkStep, loading } = useWorkStep()
const { actors, loadActors } = useActor()
const { roles, loadRoles } = useRole()
const { isAdmin } = useAuthorization()
const workStepStore = useWorkStepStore()
const workflowStore = useWorkflowStore()

const formData = ref<{
  title: string
  description?: string
  status: TaskStatus
  startDate: string
  deadlineDate: string
}>({
  title: '',
  description: '',
  status: TaskStatus.PENDING,
  startDate: '',
  deadlineDate: '',
})

const selectedAssignees = ref<string[]>([])
const selectedRoleGuid = ref<string>('') // Empty string = all users
const error = ref<string | null>(null)
const originalWorkStep = ref<WorkStep | null>(null)
const originalAssignees = ref<string[]>([])

// Show all users in the list
// Get workflow deadline to limit step deadlines
const workflow = computed(() => {
  if (!props.workStep) return undefined
  return workflowStore.getWorkflowById(props.workStep.workflowId)
})

const maxDeadlineDate = computed(() => {
  if (!workflow.value?.deadline) {
    return undefined
  }
  // Format workflow deadline for datetime-local input
  const deadline = new Date(workflow.value.deadline)
  const year = deadline.getFullYear()
  const month = String(deadline.getMonth() + 1).padStart(2, '0')
  const day = String(deadline.getDate()).padStart(2, '0')
  const hours = String(deadline.getHours()).padStart(2, '0')
  const minutes = String(deadline.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
})

// Calculate duration as time from startDate to deadlineDate (for display)
const calculatedDuration = computed(() => {
  if (!formData.value.startDate || !formData.value.deadlineDate) {
    return null
  }
  
  const startDate = new Date(formData.value.startDate)
  const deadlineDate = new Date(formData.value.deadlineDate)
  
  if (isNaN(startDate.getTime()) || isNaN(deadlineDate.getTime())) {
    return null
  }
  
  if (deadlineDate <= startDate) {
    return 0 // Invalid: deadline must be after start
  }
  
  const diffMs = deadlineDate.getTime() - startDate.getTime()
  const hours = Math.round(diffMs / (1000 * 60 * 60))
  
  return hours > 0 ? hours : 0
})

const availableUsers = computed(() => {
  return actors.value.map((actor) => ({
    id: actor.guid,
    username: actor.displayName,
    email: `${actor.displayName}@example.com`,
    role: actor.role?.displayName || 'No Role', // Show actual role name
    roleGuid: actor.role?.guid || null, // Keep role GUID for filtering
    roleObject: actor.role, // Keep role object for reference
    tenantId: undefined,
  }))
})

// Filter users based on selected role
const filteredUsers = computed(() => {
  if (!selectedRoleGuid.value) {
    // Show all users
    return availableUsers.value
  }
  
  if (selectedRoleGuid.value === 'no-role') {
    // Show only users without a role
    return availableUsers.value.filter(user => !user.roleGuid)
  }
  
  // Show only users with the selected role
  return availableUsers.value.filter(user => user.roleGuid === selectedRoleGuid.value)
})

onMounted(async () => {
  await Promise.all([loadActors(), loadRoles()])
})

// Handle role filter change
function handleRoleFilterChange() {
  // Clear selected assignees when filter changes
  selectedAssignees.value = []
  console.log('[EditWorkStepForm] Role filter changed to:', selectedRoleGuid.value)
  console.log('[EditWorkStepForm] Filtered users:', filteredUsers.value.length)
}

// Helper function to format date for datetime-local input
function formatDateForInput(date: Date | string | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  
  // Format as YYYY-MM-DDTHH:mm for datetime-local input
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Helper function to format date for API (ISO string)
function formatDateForAPI(dateString: string | undefined): string | undefined {
  if (!dateString) return undefined
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return undefined
  return date.toISOString()
}

// Initialize form with work step data
watch(
  () => props.workStep,
  async (workStep) => {
    if (workStep) {
      // Ensure actors are loaded first
      await loadActors()
      
      // Store original values for comparison
      originalWorkStep.value = { ...workStep }
      
      // Ensure dates are always provided (required fields)
      // If work step doesn't have dates, use current date/time as defaults
      const defaultStartDate = workStep.startDate 
        ? formatDateForInput(workStep.startDate)
        : formatDateForInput(new Date())
      const defaultDeadlineDate = workStep.deadlineDate
        ? formatDateForInput(workStep.deadlineDate)
        : formatDateForInput(new Date(Date.now() + 24 * 60 * 60 * 1000)) // Default to tomorrow

      formData.value = {
        title: workStep.title,
        description: workStep.description || '',
        status: workStep.status,
        startDate: defaultStartDate,
        deadlineDate: defaultDeadlineDate,
      }

      // Set selected assignees - ensure they are properly initialized
      if (workStep.assignedTo) {
        const assignees = Array.isArray(workStep.assignedTo)
          ? [...workStep.assignedTo].filter(id => id !== undefined && id !== null)
          : workStep.assignedTo ? [workStep.assignedTo] : []
        selectedAssignees.value = assignees
        originalAssignees.value = [...assignees]
      } else {
        selectedAssignees.value = []
        originalAssignees.value = []
      }
    }
  },
  { immediate: true }
)

// Watch for actors to be loaded and ensure assigned users are visible
watch(
  () => actors.value,
  () => {
    if (props.workStep && actors.value.length > 0) {
      // Re-initialize assignees to ensure they're visible
      if (props.workStep.assignedTo) {
        const assignees = Array.isArray(props.workStep.assignedTo)
          ? [...props.workStep.assignedTo].filter(id => id !== undefined && id !== null)
          : props.workStep.assignedTo ? [props.workStep.assignedTo] : []
        
        // Only update if they're different to avoid infinite loops
        const currentIds = [...selectedAssignees.value].sort().join(',')
        const newIds = [...assignees].sort().join(',')
        if (currentIds !== newIds) {
          selectedAssignees.value = assignees
          if (originalAssignees.value.length === 0) {
            originalAssignees.value = [...assignees]
          }
        }
      }
    }
  }
)

async function handleSubmit() {
  if (!props.workStep) return

  error.value = null
  
  // Validate dates
  if (formData.value.deadlineDate && formData.value.startDate) {
    const startDate = new Date(formData.value.startDate)
    const deadlineDate = new Date(formData.value.deadlineDate)
    if (deadlineDate <= startDate) {
      error.value = 'Deadline date must be after start date'
      return
    }
  }

  // Validate that step deadline is not after workflow deadline
  if (workflow.value?.deadline && formData.value.deadlineDate) {
    const deadlineDate = new Date(formData.value.deadlineDate)
    const workflowDeadline = new Date(workflow.value.deadline)
    if (deadlineDate > workflowDeadline) {
      error.value = `Deadline date cannot be after workflow deadline (${workflowDeadline.toLocaleDateString()})`
      return
    }
  }

  try {
    if (!originalWorkStep.value) {
      error.value = 'Original work step data not available'
      return
    }

    // Build update request with only changed fields
    const updateRequest: UpdateWorkStepRequest = {}

    // Only update title if it changed
    if (formData.value.title !== originalWorkStep.value.title) {
      updateRequest.title = formData.value.title
    }

    // Only update description if it changed
    const originalDescription = originalWorkStep.value.description || ''
    if (formData.value.description !== originalDescription) {
      updateRequest.description = formData.value.description
    }

    // Note: Assignment API doesn't have SetStartDate or SetDeadlineDate endpoints
    // Only duration can be updated via SetDuration endpoint
    // Calculate duration from dates if both are provided
    if (formData.value.startDate && formData.value.deadlineDate) {
      const startDate = new Date(formData.value.startDate)
      const deadlineDate = new Date(formData.value.deadlineDate)
      if (!isNaN(startDate.getTime()) && !isNaN(deadlineDate.getTime()) && deadlineDate > startDate) {
        const diffMs = deadlineDate.getTime() - startDate.getTime()
        const calculatedDuration = Math.round(diffMs / (1000 * 60 * 60)) // Convert to hours
        if (calculatedDuration > 0) {
          updateRequest.duration = calculatedDuration
          console.log('[EditWorkStepForm] Calculated duration from dates:', calculatedDuration, 'hours')
        }
      }
    }

    // Only update status if it changed
    if (formData.value.status !== originalWorkStep.value.status) {
      updateRequest.status = formData.value.status
      
      // Set completedAt if status changed to COMPLETED and it wasn't completed before
      if (formData.value.status === TaskStatus.COMPLETED && !originalWorkStep.value.completedAt) {
        updateRequest.completedAt = new Date().toISOString()
      }
    }

    // Priority is now always auto-calculated - no manual priority updates allowed

    // Only update assignees if they changed
    // Normalize arrays for comparison (sort to ensure order doesn't matter)
    const currentAssignees = [...selectedAssignees.value]
      .filter((id): id is string => id !== undefined && id !== null)
      .sort()
    
    const originalAssigneesArray = [...originalAssignees.value]
      .filter((id): id is string => id !== undefined && id !== null)
      .sort()
    
    // Compare arrays (order-independent)
    const assigneesChanged = 
      currentAssignees.length !== originalAssigneesArray.length ||
      currentAssignees.some((id) => !originalAssigneesArray.includes(id)) ||
      originalAssigneesArray.some((id) => !currentAssignees.includes(id))
    
    if (assigneesChanged) {
      
      // If multiple are selected, we'll use the first one
      if (currentAssignees.length === 0) {
        updateRequest.assignedTo = undefined
      } else if (currentAssignees.length === 1) {
        updateRequest.assignedTo = currentAssignees[0]!
      } else {
        // Multiple selected - backend only supports one, use first
        updateRequest.assignedTo = currentAssignees[0]!
        console.warn('Multiple assignees selected, but backend only supports single assignee. Using first selected:', currentAssignees[0])
      }
    }

    // Only call update if there are changes
    if (Object.keys(updateRequest).length > 0) {
      console.log('[EditWorkStepForm] Updating work step:', props.workStep.id, 'with changes:', updateRequest)
      await updateWorkStep(props.workStep.id, updateRequest)
      console.log('[EditWorkStepForm] Update successful')
    } else {
      console.log('[EditWorkStepForm] No changes detected, skipping update')
    }

    // Emit updated event to trigger reload in parent component
    emit('updated', props.workStep.id)
  } catch (err) {
    console.error('[EditWorkStepForm] Update error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to update work step'
    throw err // Re-throw to prevent form from closing on error
  }
}
</script>

<style scoped>
.edit-workstep-form {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border-light);
  margin-bottom: 0;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.form-header h3 {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.btn-close {
  background: none;
  border: none;
  font-size: var(--text-2xl);
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.btn-close:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group--inline {
  margin-bottom: var(--spacing-md);
}

.form-label--small {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  color: var(--color-text-secondary);
}

.form-label {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
}

.form-input,
.form-textarea,
.form-select {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-family);
  transition: all var(--transition-base);
  background: var(--color-surface);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-select {
  cursor: pointer;
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
  font-style: italic;
}

.duration-display {
  padding: var(--spacing-md);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.duration-value {
  margin-top: var(--spacing-xs);
}

.duration-value strong {
  font-size: var(--text-lg);
  color: var(--color-primary);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.assignees-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 200px;
  overflow-y: auto;
  padding: var(--spacing-sm);
  background: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.assignee-checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: background var(--transition-base);
}

.assignee-checkbox:hover {
  background: var(--color-surface-hover);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.checkbox-label {
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  user-select: none;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.user-name {
  font-weight: var(--font-medium);
}

.user-role {
  display: inline-flex;
  align-items: center;
}

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  border: 1px solid var(--color-primary);
}

.role-badge--no-role {
  background: var(--color-background);
  color: var(--color-text-tertiary);
  border-color: var(--color-border);
}

.no-users {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  font-style: italic;
}

.form-error {
  padding: var(--spacing-md);
  background: var(--color-error-light);
  color: var(--color-error);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-md);
}

.btn {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn--secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn--secondary:hover {
  background: var(--color-surface-hover);
}

/* Enhanced Date Picker Styles */
.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-icon {
  position: absolute;
  left: var(--spacing-md);
  width: 20px;
  height: 20px;
  color: var(--color-text-secondary);
  pointer-events: none;
  z-index: 1;
  transition: color var(--transition-base);
}

.date-input {
  padding-left: calc(var(--spacing-md) + 28px);
  position: relative;
  cursor: pointer;
}

.date-input:hover {
  border-color: var(--color-primary-light);
}

.date-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.date-input:focus + .date-icon,
.date-input-wrapper:focus-within .date-icon {
  color: var(--color-primary);
}

/* Custom styling for datetime-local input */
.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 1;
  position: absolute;
  right: var(--spacing-md);
  width: 20px;
  height: 20px;
  z-index: 2;
  filter: brightness(0) saturate(100%) invert(58%) sepia(7%) saturate(1000%) hue-rotate(182deg) brightness(92%) contrast(88%);
  transition: filter var(--transition-base);
}

.date-input:hover::-webkit-calendar-picker-indicator,
.date-input:focus::-webkit-calendar-picker-indicator {
  filter: brightness(0) saturate(100%) invert(37%) sepia(96%) saturate(7498%) hue-rotate(212deg) brightness(98%) contrast(96%);
}
</style>






