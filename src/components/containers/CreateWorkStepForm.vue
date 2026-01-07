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
          <label for="step-sequence" class="form-label">Sequence Number *</label>
          <input
            id="step-sequence"
            v-model.number="formData.sequenceNumber"
            type="number"
            class="form-input"
            required
            min="1"
            step="1"
            placeholder="e.g., 1"
          />
        </div>
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
              :min="minStartDate"
            />
          </div>
          <small class="form-hint">Optional - cannot be in the past</small>
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
              :min="minDeadlineDate"
            />
          </div>
          <small class="form-hint">Optional - must be after start date</small>
        </div>
      </div>

      <div class="form-group">
        <label for="step-role" class="form-label">Required Role</label>
        <select
          id="step-role"
          v-model="selectedRoleGuid"
          class="form-select"
        >
          <option :value="null">No Role Required</option>
          <option
            v-for="role in roles"
            :key="role.guid"
            :value="role.guid"
          >
            {{ role.displayName }}{{ role.isAdmin ? ' (Admin)' : '' }}
          </option>
        </select>
        <small v-if="roles.length === 0" class="form-hint form-hint--error">
          No roles available. Please create a role first.
        </small>
        <small v-else class="form-hint">
          {{ roles.length }} role(s) available. Select a role to filter users.
        </small>
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
          <p v-if="actors.length === 0" class="no-users">
            No users available. Please create users first.
          </p>
          <p v-else-if="availableUsers.length === 0 && selectedRoleGuid" class="no-users">
            No users available with the selected role. Try selecting "No Role Required" to see all users.
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useWorkStep } from '@/composables/useWorkStep'
import { useActor } from '@/composables/useActor'
import { useRole } from '@/composables/useRole'
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
const { roles, loadRoles } = useRole()

const formData = ref<CreateWorkStepRequest>({
  title: '',
  description: '',
  duration: 8,
  workflowId: props.workflowId,
  sequenceNumber: 1,
  requiredRole: Role.TEAM_MEMBER,
  assignedTo: undefined,
  startDate: undefined,
  deadlineDate: undefined,
})

const selectedAssignees = ref<string[]>([])
const selectedRoleGuid = ref<string | null>(null)
const error = ref<string | null>(null)

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

// Filter actors by selected role GUID
const availableUsers = computed(() => {
  console.log('[CreateWorkStepForm] availableUsers computed - actors:', actors.value.length, 'selectedRoleGuid:', selectedRoleGuid.value)
  
  // If no role is selected, show all actors
  if (!selectedRoleGuid.value) {
    const allUsers = actors.value.map((actor) => ({
      id: actor.guid,
      username: actor.displayName,
      email: `${actor.displayName}@example.com`,
      role: actor.role?.isAdmin ? Role.ADMIN : Role.TEAM_MEMBER,
      tenantId: undefined,
    }))
    console.log('[CreateWorkStepForm] No role selected, showing all users:', allUsers.length)
    return allUsers
  }
  
  // Filter actors that have the selected role
  const filteredUsers = actors.value
    .filter((actor) => {
      if (!actor.role) {
        console.log('[CreateWorkStepForm] Actor has no role:', actor.displayName)
        return false
      }
      // Check if actor's role GUID matches the selected role GUID
      const matches = actor.role.guid === selectedRoleGuid.value
      console.log('[CreateWorkStepForm] Actor role check:', actor.displayName, 'role.guid:', actor.role.guid, 'selectedRoleGuid:', selectedRoleGuid.value, 'matches:', matches)
      return matches
    })
    .map((actor) => ({
      id: actor.guid,
      username: actor.displayName,
      email: `${actor.displayName}@example.com`,
      role: actor.role?.isAdmin ? Role.ADMIN : Role.TEAM_MEMBER,
      tenantId: undefined,
    }))
  
  console.log('[CreateWorkStepForm] Filtered users for role:', filteredUsers.length)
  return filteredUsers
})

onMounted(async () => {
  console.log('[CreateWorkStepForm] onMounted - loading actors and roles...')
  try {
    await Promise.all([loadActors(), loadRoles()])
    console.log('[CreateWorkStepForm] Loaded actors:', actors.value.length, 'roles:', roles.value.length)
    console.log('[CreateWorkStepForm] Actors:', actors.value)
    console.log('[CreateWorkStepForm] Roles:', roles.value)
  } catch (err) {
    console.error('[CreateWorkStepForm] Error loading actors/roles:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load actors or roles'
  }
})

// Watch for role GUID changes and update available users
watch(() => selectedRoleGuid.value, () => {
  // Clear assignee selections when role changes (they might not have the new role)
  selectedAssignees.value = []
})

async function handleSubmit() {
  error.value = null
  try {
    // Validate dates
    if (formData.value.startDate) {
      const startDate = new Date(formData.value.startDate)
      const now = new Date()
      if (startDate < now) {
        error.value = 'Start date cannot be in the past'
        return
      }
    }

    if (formData.value.deadlineDate) {
      const deadlineDate = new Date(formData.value.deadlineDate)
      const now = new Date()
      if (deadlineDate < now) {
        error.value = 'Deadline date cannot be in the past'
        return
      }

      if (formData.value.startDate) {
        const startDate = new Date(formData.value.startDate)
        if (deadlineDate <= startDate) {
          error.value = 'Deadline date must be after start date'
          return
        }
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

    // Format dates to ISO string for API
    const formatDateForAPI = (dateString: string | null | undefined): string | undefined => {
      if (!dateString) return undefined
      return new Date(dateString).toISOString()
    }

    // Create work step request with only the necessary fields
    // Don't spread formData.value to avoid including unwanted properties
    const workStep = await createWorkStep({
      title: formData.value.title,
      description: formData.value.description,
      duration: formData.value.duration,
      workflowId: formData.value.workflowId,
      sequenceNumber: formData.value.sequenceNumber,
      requiredRole: formData.value.requiredRole, // Keep for backward compatibility
      requiredRoleGuid: selectedRoleGuid.value, // Use selected role GUID
      assignedTo: assignedTo, // Use the processed assignedTo value
      startDate: formatDateForAPI(formData.value.startDate),
      deadlineDate: formatDateForAPI(formData.value.deadlineDate),
    })

    // Reset form
    formData.value = {
      title: '',
      description: '',
      duration: 8,
      workflowId: props.workflowId,
      sequenceNumber: formData.value.sequenceNumber + 1, // Increment for next step
      requiredRole: Role.TEAM_MEMBER,
      requiredRoleGuid: undefined,
      assignedTo: undefined,
      startDate: undefined,
      deadlineDate: undefined,
    }
    selectedAssignees.value = []
    selectedRoleGuid.value = null

    emit('created', workStep.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create work step'
  }
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

.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-xs);
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

