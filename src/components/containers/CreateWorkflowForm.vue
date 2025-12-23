<!--
  CreateWorkflowForm - Container Component
  Form to create new workflows with deadline
-->
<template>
  <div v-if="showForm" class="create-workflow-form">
    <div class="form-header">
      <h3>Create New Workflow</h3>
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
        <label for="workflow-deadline" class="form-label">Deadline *</label>
        <input
          id="workflow-deadline"
          v-model="formData.deadline"
          type="datetime-local"
          class="form-input"
          required
        />
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
          <span v-else>Create Workflow</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkflow } from '@/composables/useWorkflow'
import { useUser } from '@/composables/useUser'
import type { CreateWorkflowRequest } from '@/types/api'

interface Props {
  showForm?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showForm: false,
})

const emit = defineEmits<{
  close: []
  created: [workflowId: string]
}>()

const { createWorkflow, loading } = useWorkflow()
const { currentUser } = useUser()

const formData = ref<CreateWorkflowRequest>({
  name: '',
  description: '',
  deadline: '',
  workflowManagerId: currentUser.value?.id,
  tenantId: currentUser.value?.tenantId,
})

const error = ref<string | null>(null)

async function handleSubmit() {
  error.value = null
  try {
    // Convert deadline to ISO string
    const deadlineISO = formData.value.deadline
      ? new Date(formData.value.deadline).toISOString()
      : undefined

    const workflow = await createWorkflow({
      name: formData.value.name,
      description: formData.value.description,
      deadline: deadlineISO,
      workflowManagerId: currentUser.value?.id,
      tenantId: currentUser.value?.tenantId,
    })

    // Reset form
    formData.value = {
      name: '',
      description: '',
      deadline: '',
      workflowManagerId: currentUser.value?.id,
      tenantId: currentUser.value?.tenantId,
    }

    emit('created', workflow.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create workflow'
  }
}
</script>

<style scoped>
.create-workflow-form {
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
</style>



