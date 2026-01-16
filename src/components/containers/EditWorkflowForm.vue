<!--
  EditWorkflowForm - Container Component
  Form to edit existing workflow details
-->
<template>
  <div v-if="showForm" class="edit-workflow-form">
    <div class="form-header">
      <h3>Edit Workflow</h3>
      <button @click="$emit('close')" class="btn-close">×</button>
    </div>

    <form @submit.prevent="handleSubmit" class="form-content">
      <div class="form-group">
        <label for="workflow-name" class="form-label">Workflow Name *</label>
        <input
          id="workflow-name"
          v-model="formData.name"
          type="text"
          class="form-input"
          required
          placeholder="Enter workflow name"
        />
      </div>

      <div class="form-group">
        <label for="workflow-description" class="form-label">Description</label>
        <textarea
          id="workflow-description"
          v-model="formData.description"
          class="form-textarea"
          rows="3"
          placeholder="Enter workflow description"
        />
      </div>

      <div class="form-group">
        <label for="workflow-deadline" class="form-label">Deadline</label>
        <div class="date-input-wrapper">
          <svg class="date-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <input
            id="workflow-deadline"
            v-model="formData.deadline"
            type="datetime-local"
            class="form-input date-input"
            disabled
          />
        </div>
        <small class="form-hint">Deadline cannot be changed after workflow creation</small>
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
          <span v-else>Update Workflow</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWorkflow } from '@/composables/useWorkflow'
import type { Workflow } from '@/types/domain'
import type { CreateWorkflowRequest } from '@/types/api'

interface Props {
  showForm?: boolean
  workflow: Workflow | null
}

const props = withDefaults(defineProps<Props>(), {
  showForm: false,
  workflow: null,
})

const emit = defineEmits<{
  close: []
  updated: [workflowId: string]
}>()

const { updateWorkflow, loading } = useWorkflow()

const formData = ref<CreateWorkflowRequest>({
  name: '',
  description: '',
  deadline: '',
})

const error = ref<string | null>(null)

// Initialize form with workflow data
watch(
  () => props.workflow,
  (workflow) => {
    if (workflow) {
      formData.value = {
        name: workflow.name,
        description: workflow.description || '',
        deadline: workflow.deadline
          ? new Date(workflow.deadline).toISOString().slice(0, 16)
          : '',
      }
    }
  },
  { immediate: true }
)

async function handleSubmit() {
  if (!props.workflow) return

  error.value = null
  try {
    console.log('[EditWorkflowForm] Submitting update for workflow:', props.workflow.id)
    console.log('[EditWorkflowForm] Form data:', formData.value)
    
    // Build update request with only changed fields
    const updateRequest: Partial<CreateWorkflowRequest> = {}
    
    // Check if name changed
    if (formData.value.name !== props.workflow.name) {
      updateRequest.name = formData.value.name
      console.log('[EditWorkflowForm] Name changed:', props.workflow.name, '->', formData.value.name)
    }
    
    // Check if description changed
    const originalDescription = props.workflow.description || ''
    if (formData.value.description !== originalDescription) {
      updateRequest.description = formData.value.description
      console.log('[EditWorkflowForm] Description changed')
    }
    
    // Note: Deadline cannot be updated - the API doesn't have a SetDeadlineDate endpoint
    // Deadline can only be set during workflow creation
    // We don't include deadline in the update request
    
    // Only update if there are changes
    if (Object.keys(updateRequest).length === 0) {
      console.log('[EditWorkflowForm] No changes detected')
      error.value = 'No changes to save'
      return
    }
    
    console.log('[EditWorkflowForm] Update request:', updateRequest)
    
    await updateWorkflow(props.workflow.id, updateRequest)
    
    console.log('[EditWorkflowForm] Workflow updated successfully')
    emit('updated', props.workflow.id)
  } catch (err) {
    console.error('[EditWorkflowForm] Error updating workflow:', err)
    const errorMessage = err instanceof Error 
      ? err.message 
      : typeof err === 'object' && err !== null && 'message' in err
      ? String(err.message)
      : 'Failed to update workflow'
    error.value = errorMessage
    console.error('[EditWorkflowForm] Error message:', errorMessage)
  }
}
</script>

<style scoped>
.edit-workflow-form {
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

.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-xs);
}

.form-input,
.form-textarea {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-family);
  transition: all var(--transition-base);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
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

.date-input:disabled {
  background: var(--color-background);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
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






