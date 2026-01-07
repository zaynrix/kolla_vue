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
        <label for="step-duration" class="form-label">Duration (hours) *</label>
        <input
          id="step-duration"
          v-model.number="formData.duration"
          type="number"
          class="form-input"
          required
          min="1"
          step="1"
          placeholder="e.g., 8"
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
          <label for="step-start-date" class="form-label">Start Date</label>
          <div class="date-input-wrapper">
            <svg class="date-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              id="step-start-date"
              v-model="formData.startDate"
              type="datetime-local"
              class="form-input date-input"
            />
          </div>
          <small class="form-hint">Optional - when the assignment should start</small>
        </div>

        <div class="form-group">
          <label for="step-deadline-date" class="form-label">Deadline Date</label>
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
            />
          </div>
          <small class="form-hint">Optional - must be after start date</small>
        </div>
      </div>

      <div class="form-group">
        <label for="step-role" class="form-label">Required Role *</label>
        <select
          id="step-role"
          v-model="selectedRoleGuid"
          class="form-select"
          required
        >
          <option value="">Select Role</option>
          <option
            v-for="role in roles"
            :key="role.guid"
            :value="role.guid"
          >
            {{ role.displayName }}{{ role.isAdmin ? ' (Admin)' : '' }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="step-assignees" class="form-label">Assign To Users (Optional)</label>
        <div class="assignees-container">
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
          <p v-if="availableUsers.length === 0" class="no-users">
            No users available with the selected role.
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
import { useAssignment } from '@/composables/useAssignment'
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
const { updateRequiredRole } = useAssignment()

const formData = ref<{
  title: string
  description?: string
  duration: number
  requiredRole: Role
  status: TaskStatus
  startDate?: string
  deadlineDate?: string
}>({
  title: '',
  description: '',
  duration: 8,
  requiredRole: Role.TEAM_MEMBER,
  status: TaskStatus.PENDING,
  startDate: undefined,
  deadlineDate: undefined,
})

const selectedAssignees = ref<string[]>([])
const selectedRoleGuid = ref<string | null>(null)
const error = ref<string | null>(null)
const originalWorkStep = ref<WorkStep | null>(null)
const originalRoleGuid = ref<string | null>(null)
const originalAssignees = ref<string[]>([])

// Filter actors by selected role GUID
// Always include currently assigned users, even if they don't have the selected role
const availableUsers = computed(() => {
  // Get all actors
  const allActors = actors.value.map((actor) => ({
    id: actor.guid,
    username: actor.displayName,
    email: `${actor.displayName}@example.com`,
    role: actor.role?.isAdmin ? Role.ADMIN : Role.TEAM_MEMBER,
    tenantId: undefined,
  }))
  
  // Get currently assigned user IDs (from originalAssignees to ensure they're always shown)
  const assignedIds = new Set([
    ...selectedAssignees.value,
    ...originalAssignees.value
  ])
  
  // If no role is selected, show all actors
  if (!selectedRoleGuid.value) {
    return allActors
  }
  
  // Filter actors that have the selected role OR are currently assigned
  return allActors.filter((actor) => {
    // Always include if currently assigned (from original or selected)
    if (assignedIds.has(actor.id)) {
      return true
    }
    
    // Otherwise, only include if they have the selected role
    const actorObj = actors.value.find((a) => a.guid === actor.id)
    if (!actorObj?.role) return false
    return actorObj.role.guid === selectedRoleGuid.value
  })
})

onMounted(async () => {
  await Promise.all([loadActors(), loadRoles()])
})

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
      // Ensure actors and roles are loaded first
      await Promise.all([loadActors(), loadRoles()])
      
      // Store original values for comparison
      originalWorkStep.value = { ...workStep }
      
      formData.value = {
        title: workStep.title,
        description: workStep.description || '',
        duration: workStep.duration,
        requiredRole: workStep.requiredRole,
        status: workStep.status,
        startDate: workStep.startDate ? formatDateForInput(workStep.startDate) : undefined,
        deadlineDate: workStep.deadlineDate ? formatDateForInput(workStep.deadlineDate) : undefined,
      }

      // Find and set the role GUID that matches the workStep's requiredRole
      // Try to find a role that matches the enum value
      let matchingRole = null
      if (workStep.requiredRole === Role.ADMIN) {
        // Find the first admin role
        matchingRole = roles.value.find((role) => role.isAdmin)
      } else {
        // For non-admin roles, find the first non-admin role
        // Note: This is a best guess since Role enum only has TEAM_MEMBER and ADMIN
        matchingRole = roles.value.find((role) => !role.isAdmin)
      }
      
      selectedRoleGuid.value = matchingRole?.guid || null
      originalRoleGuid.value = matchingRole?.guid || null

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

// Watch for roles to be loaded and try to match the role again
watch(
  () => roles.value,
  () => {
    if (props.workStep && !selectedRoleGuid.value && roles.value.length > 0) {
      // Try to find matching role again once roles are loaded
      let matchingRole = null
      if (props.workStep.requiredRole === Role.ADMIN) {
        matchingRole = roles.value.find((role) => role.isAdmin)
      } else {
        matchingRole = roles.value.find((role) => !role.isAdmin)
      }
      if (matchingRole) {
        selectedRoleGuid.value = matchingRole.guid
        originalRoleGuid.value = matchingRole.guid
      }
    }
  }
)

// Watch for role GUID changes - keep assigned users even if role changes
// Don't clear assignees when role changes, as they might still be valid
watch(() => selectedRoleGuid.value, () => {
  // Don't clear assignees - they should remain selected even if role changes
  // The availableUsers computed will still show them
})

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

    // Only update duration if it changed
    // Note: Duration is calculated from startDate and deadlineDate, but we allow manual override
    if (formData.value.duration !== originalWorkStep.value.duration) {
      updateRequest.duration = formData.value.duration
    }

    // Only update start date if it changed
    const originalStartDate = originalWorkStep.value.startDate 
      ? formatDateForInput(originalWorkStep.value.startDate)
      : undefined
    const currentStartDate = formData.value.startDate || undefined
    if (currentStartDate !== originalStartDate) {
      updateRequest.startDate = currentStartDate 
        ? formatDateForAPI(currentStartDate)
        : null
    }

    // Only update deadline date if it changed
    const originalDeadlineDate = originalWorkStep.value.deadlineDate
      ? formatDateForInput(originalWorkStep.value.deadlineDate)
      : undefined
    const currentDeadlineDate = formData.value.deadlineDate || undefined
    if (currentDeadlineDate !== originalDeadlineDate) {
      updateRequest.deadlineDate = currentDeadlineDate
        ? formatDateForAPI(currentDeadlineDate)
        : null
    }

    // Only update status if it changed
    if (formData.value.status !== originalWorkStep.value.status) {
      updateRequest.status = formData.value.status
      
      // Set completedAt if status changed to COMPLETED and it wasn't completed before
      if (formData.value.status === TaskStatus.COMPLETED && !originalWorkStep.value.completedAt) {
        updateRequest.completedAt = new Date().toISOString()
      }
    }

    // Priority is automatically calculated by the backend based on workflow deadline and duration
    // No manual priority updates allowed

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
      // Backend only supports single assignee, so use first selected
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

    // Update the required role if it has changed
    if (selectedRoleGuid.value !== originalRoleGuid.value && selectedRoleGuid.value) {
      console.log('[EditWorkStepForm] Updating required role:', selectedRoleGuid.value)
      await updateRequiredRole(props.workStep.id, selectedRoleGuid.value)
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






