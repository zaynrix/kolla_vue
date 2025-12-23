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

      <div class="form-group">
        <label for="step-role" class="form-label">Required Role *</label>
        <select
          id="step-role"
          v-model="formData.requiredRole"
          class="form-select"
          required
        >
          <option value="">Select Role</option>
          <option value="TEAM_MEMBER">Team Member</option>
          <option value="WORKFLOW_MANAGER">Workflow Manager</option>
          <option value="ADMIN">Admin</option>
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
import { ref, computed, watch } from 'vue'
import { useWorkStep } from '@/composables/useWorkStep'
import { mockUsers } from '@/services/mock/mockData'
import type { UpdateWorkStepRequest } from '@/types/api'
import { Role } from '@/types/domain'
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

const formData = ref<{
  title: string
  description?: string
  duration: number
  sequenceNumber: number
  requiredRole: Role
}>({
  title: '',
  description: '',
  duration: 8,
  sequenceNumber: 1,
  requiredRole: Role.TEAM_MEMBER,
})

const selectedAssignees = ref<string[]>([])
const error = ref<string | null>(null)

// Filter users by required role
const availableUsers = computed(() => {
  return mockUsers.filter((user) => user.role === formData.value.requiredRole)
})

// Initialize form with work step data
watch(
  () => props.workStep,
  (workStep) => {
    if (workStep) {
      formData.value = {
        title: workStep.title,
        description: workStep.description || '',
        duration: workStep.duration,
        sequenceNumber: workStep.sequenceNumber,
        requiredRole: workStep.requiredRole,
      }

      // Set selected assignees
      if (workStep.assignedTo) {
        selectedAssignees.value = Array.isArray(workStep.assignedTo)
          ? [...workStep.assignedTo]
          : [workStep.assignedTo]
      } else {
        selectedAssignees.value = []
      }
    }
  },
  { immediate: true }
)

// Watch for role changes and update available users
watch(() => formData.value.requiredRole, () => {
  // Clear selections if role changes and user doesn't have new role
  selectedAssignees.value = selectedAssignees.value.filter((userId) => {
    const user = mockUsers.find((u) => u.id === userId)
    return user?.role === formData.value.requiredRole
  })
})

async function handleSubmit() {
  if (!props.workStep) return

  error.value = null
  try {
    // Convert selected assignees to array (or single string if only one, or undefined if none)
    let assignedTo: string | string[] | undefined
    if (selectedAssignees.value.length === 0) {
      assignedTo = undefined
    } else if (selectedAssignees.value.length === 1) {
      assignedTo = selectedAssignees.value[0]
    } else {
      assignedTo = [...selectedAssignees.value]
    }

    const updateRequest: UpdateWorkStepRequest = {
      title: formData.value.title,
      description: formData.value.description,
      duration: formData.value.duration,
      assignedTo,
    }

    await updateWorkStep(props.workStep.id, updateRequest)

    emit('updated', props.workStep.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update work step'
  }
}
</script>

<style scoped>
.edit-workstep-form {
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
</style>




