<!--
  CreateWorkStepForm - Container Component
  Form to create new work steps for a workflow
-->
<template>
  <div v-if="showForm" class="create-workstep-form">
    <div class="form-header">
      <h3>Add Work Step to Workflow</h3>
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
              :min="minStartDate"
              required
            />
          </div>
          <small class="form-hint">Cannot be in the past</small>
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
              :min="minDeadlineDate"
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
        <div class="assignees-container">
          <!-- Select All Option -->
          <div v-if="availableUsers.length > 0" class="assignee-checkbox assignee-checkbox--select-all">
            <input
              id="assignee-select-all"
              type="checkbox"
              :checked="selectedAssignees.length === availableUsers.length && availableUsers.length > 0"
              @change="handleSelectAll"
              class="checkbox-input"
            />
            <label for="assignee-select-all" class="checkbox-label checkbox-label--select-all">
              <strong>Select All Users</strong>
            </label>
          </div>
          
          <div
            v-for="user in availableUsers"
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
              {{ user.username }} ({{ user.role }})
            </label>
          </div>
          <p v-if="actors.length === 0" class="no-users">
            No users available. Please create users first.
          </p>
          <p v-else-if="availableUsers.length === 0" class="no-users">
            No users available.
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
          <span v-if="loading">Creating...</span>
          <span v-else>Create Work Step</span>
        </button>
      </div>
    </form>

    <!-- Success Dialog -->
    <SuccessDialog
      :show="showSuccessDialog"
      title="Success"
      message="Work step created successfully!"
      @close="handleSuccessDialogClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorkStep } from '@/composables/useWorkStep'
import { useActor } from '@/composables/useActor'
import { useWorkflowStore } from '@/stores/workflow'
import { useWorkStepStore } from '@/stores/workStep'
import SuccessDialog from '@/components/presenters/SuccessDialog.vue'
import type { CreateWorkStepRequest } from '@/types/api'
import { Role } from '@/types/domain'
import type { ActorDto } from '@/types/api'

interface Props {
  showForm?: boolean
  workflowId: string
}

const props = withDefaults(defineProps<Props>(), {
  showForm: false,
})

const emit = defineEmits<{
  close: []
  created: [workStepId: string]
}>()

const { createWorkStep, loading } = useWorkStep()
const { actors, loadActors } = useActor()
const workflowStore = useWorkflowStore()
const workStepStore = useWorkStepStore()

// Calculate next sequence number based on existing work steps in the workflow
const calculateNextSequenceNumber = (): number => {
  const workflowSteps = workStepStore.getWorkStepsByWorkflow(props.workflowId)
  if (workflowSteps.length === 0) {
    return 1
  }
  // Get the highest sequence number and add 1
  const maxSequence = Math.max(...workflowSteps.map(ws => ws.sequenceNumber || 0))
  return maxSequence + 1
}

const formData = ref<CreateWorkStepRequest>({
  title: '',
  description: '',
  duration: 8, // Will be calculated automatically from startDate and deadlineDate
  workflowId: props.workflowId,
  sequenceNumber: 1, // Will be calculated before submit
  requiredRole: Role.TEAM_MEMBER,
  assignedTo: undefined,
  startDate: undefined,
  deadlineDate: undefined,
})

const selectedAssignees = ref<string[]>([])
const error = ref<string | null>(null)
const showSuccessDialog = ref(false)
const createdWorkStepId = ref<string | null>(null)

// Computed properties for date minimums
const minStartDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
})

const minDeadlineDate = computed(() => {
  if (formData.value.startDate) {
    return formData.value.startDate
  }
  return minStartDate.value
})

// Get workflow deadline to limit step deadlines
const workflow = computed(() => workflowStore.getWorkflowById(props.workflowId))
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

// Show all users (not filtered by role)
const availableUsers = computed(() => {
  console.log('[CreateWorkStepForm] availableUsers computed - actors:', actors.value.length)
  
  // Always show all actors/users
  const allUsers = actors.value.map((actor) => ({
    id: actor.guid,
    username: actor.displayName,
    email: `${actor.displayName}@example.com`,
    role: actor.role?.isAdmin ? Role.ADMIN : Role.TEAM_MEMBER,
    tenantId: undefined,
  }))
  
  console.log('[CreateWorkStepForm] Showing all users:', allUsers.length)
  return allUsers
})

onMounted(async () => {
  console.log('[CreateWorkStepForm] onMounted - loading actors...')
  try {
    await loadActors()
    console.log('[CreateWorkStepForm] Loaded actors:', actors.value.length)
    console.log('[CreateWorkStepForm] Actors:', actors.value)
  } catch (err) {
    console.error('[CreateWorkStepForm] Error loading actors:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load actors'
  }
})

// Handle select all users
function handleSelectAll(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    // Select all users
    selectedAssignees.value = availableUsers.value.map(user => user.id)
  } else {
    // Deselect all users
    selectedAssignees.value = []
  }
}

async function handleSubmit() {
  error.value = null
  try {
    // Validate that dates are provided (required fields)
    if (!formData.value.startDate) {
      error.value = 'Start date is required'
      return
    }

    if (!formData.value.deadlineDate) {
      error.value = 'Deadline date is required'
      return
    }

    // Validate dates
    const startDate = new Date(formData.value.startDate)
    const deadlineDate = new Date(formData.value.deadlineDate)
    const now = new Date()

    if (startDate < now) {
      error.value = 'Start date cannot be in the past'
      return
    }

    if (deadlineDate < now) {
      error.value = 'Deadline date cannot be in the past'
      return
    }

    if (deadlineDate <= startDate) {
      error.value = 'Deadline date must be after start date'
      return
    }

    // Validate that step deadline is not after workflow deadline
    if (workflow.value?.deadline) {
      const workflowDeadline = new Date(workflow.value.deadline)
      if (deadlineDate > workflowDeadline) {
        error.value = `Deadline date cannot be after workflow deadline (${workflowDeadline.toLocaleDateString()})`
        return
      }
    }

    // Convert selected assignees to array (or single string if only one, or undefined if none)
    let assignedTo: string | string[] | undefined
    if (selectedAssignees.value.length === 0) {
      assignedTo = undefined
    } else if (selectedAssignees.value.length === 1) {
      assignedTo = selectedAssignees.value[0]
    } else {
      assignedTo = [...selectedAssignees.value]
    }

    // Format dates to ISO string for API (dates are required, so they will always be defined)
    const formatDateForAPI = (dateString: string): string => {
      return new Date(dateString).toISOString()
    }

    // Calculate duration as time from startDate to deadlineDate (not from now)
    const diffMs = deadlineDate.getTime() - startDate.getTime()
    const calculatedDuration = Math.round(diffMs / (1000 * 60 * 60)) // Convert to hours
    const duration = calculatedDuration > 0 ? calculatedDuration : 1 // Minimum 1 hour

    // Calculate sequence number based on existing work steps
    const nextSequenceNumber = calculateNextSequenceNumber()

    console.log('[CreateWorkStepForm] Creating work step with:', {
      title: formData.value.title,
      duration,
      sequenceNumber: nextSequenceNumber,
      startDate: formatDateForAPI(formData.value.startDate!),
      deadlineDate: formatDateForAPI(formData.value.deadlineDate!),
      assignedTo,
    })

    // Create work step request with only the necessary fields
    // Don't spread formData.value to avoid including unwanted properties
    const workStep = await createWorkStep({
      title: formData.value.title,
      description: formData.value.description,
      duration: duration, // Automatically calculated from startDate and deadlineDate
      workflowId: formData.value.workflowId,
      sequenceNumber: nextSequenceNumber, // Use calculated sequence number
      requiredRole: formData.value.requiredRole, // Keep for backward compatibility
      assignedTo: assignedTo, // Use the processed assignedTo value
      startDate: formatDateForAPI(formData.value.startDate!),
      deadlineDate: formatDateForAPI(formData.value.deadlineDate!),
    })

    // Reset form
    formData.value = {
      title: '',
      description: '',
      duration: 8, // Will be calculated automatically when dates are set
      workflowId: props.workflowId,
      sequenceNumber: 1, // Default sequence number (backend may handle ordering)
      requiredRole: Role.TEAM_MEMBER,
      assignedTo: undefined,
      startDate: undefined,
      deadlineDate: undefined,
    }
    selectedAssignees.value = []

    // Store the created work step ID
    createdWorkStepId.value = workStep.id

    // Show success dialog
    showSuccessDialog.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create work step'
  }
}

function handleSuccessDialogClose() {
  showSuccessDialog.value = false
  
  // Emit created event with the work step ID
  if (createdWorkStepId.value) {
    emit('created', createdWorkStepId.value)
    createdWorkStepId.value = null
  }
  
  // Close the form after dialog is closed
  emit('close')
}
</script>

<style scoped>
.create-workstep-form {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-light);
  margin-bottom: var(--spacing-xl);
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

.assignee-checkbox--select-all {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  background: var(--color-surface);
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
}

.checkbox-label--select-all {
  font-weight: var(--font-semibold);
  color: var(--color-primary);
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

.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-xs);
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

