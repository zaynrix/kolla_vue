<!--
  CreateRoleForm - Container Component
  Form for creating new roles
-->
<template>
  <div class="create-role-form">
    <h3>Create New Role</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="role-display-name" class="form-label">Display Name *</label>
        <input
          id="role-display-name"
          v-model="formData.displayName"
          type="text"
          class="form-input"
          required
          placeholder="e.g., Team Member, Manager"
        />
      </div>

      <div class="form-group">
        <label for="role-description" class="form-label">Description</label>
        <textarea
          id="role-description"
          v-model="formData.description"
          class="form-textarea"
          rows="3"
          placeholder="Optional description of the role"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">
          <input
            type="checkbox"
            v-model="formData.isAdmin"
            class="form-checkbox"
          />
          <span>Admin Role</span>
        </label>
        <p class="form-hint">Admin roles have full system access</p>
      </div>

      <div v-if="error" class="form-error">
        {{ error }}
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn btn--secondary">
          Cancel
        </button>
        <button type="submit" :disabled="loading" class="btn btn--primary">
          <span v-if="loading">Creating...</span>
          <span v-else>Create Role</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRole } from '@/composables/useRole'
import type { CreateRoleRequest } from '@/types/api'

const emit = defineEmits<{
  created: []
  cancel: []
}>()

const { createRole, loading } = useRole()

const formData = ref<CreateRoleRequest>({
  displayName: '',
  description: '',
  isAdmin: false,
})

const error = ref<string | null>(null)

async function handleSubmit() {
  error.value = null
  try {
    await createRole(formData.value)
    // Reset form
    formData.value = {
      displayName: '',
      description: '',
      isAdmin: false,
    }
    emit('created')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create role'
  }
}
</script>

<style scoped>
.create-role-form {
  width: 100%;
}

.create-role-form h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background: var(--color-surface);
  transition: border-color var(--transition-base);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.form-textarea {
  resize: vertical;
}

.form-checkbox {
  margin-right: var(--spacing-xs);
  cursor: pointer;
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-xs);
  margin-left: 1.5rem;
}

.form-error {
  color: var(--color-danger);
  font-size: var(--text-sm);
  margin-top: var(--spacing-md);
  text-align: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}
</style>








