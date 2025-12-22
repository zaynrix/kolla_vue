<!--
  EditRoleForm - Container Component
  Form for editing existing roles
-->
<template>
  <div class="edit-role-form">
    <h3>Edit Role</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="edit-role-display-name" class="form-label">Display Name *</label>
        <input
          id="edit-role-display-name"
          v-model="formData.displayName"
          type="text"
          class="form-input"
          required
        />
      </div>

      <div class="form-group">
        <label for="edit-role-description" class="form-label">Description</label>
        <textarea
          id="edit-role-description"
          v-model="formData.description"
          class="form-textarea"
          rows="3"
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
      </div>

      <div v-if="error" class="form-error">
        {{ error }}
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn btn--secondary">
          Cancel
        </button>
        <button type="submit" :disabled="loading" class="btn btn--primary">
          <span v-if="loading">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRole } from '@/composables/useRole'
import type { RoleDto } from '@/types/api'

interface Props {
  role: RoleDto
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: []
  cancel: []
}>()

const { updateRoleDisplayName, updateRoleDescription, updateRoleAdminFlag, loading } = useRole()

const formData = ref({
  displayName: props.role.displayName,
  description: props.role.description || '',
  isAdmin: props.role.isAdmin,
})

const error = ref<string | null>(null)

watch(
  () => props.role,
  (newRole) => {
    formData.value = {
      displayName: newRole.displayName,
      description: newRole.description || '',
      isAdmin: newRole.isAdmin,
    }
  },
  { immediate: true }
)

async function handleSubmit() {
  error.value = null
  try {
    // Update each field separately (as per backend API design)
    if (formData.value.displayName !== props.role.displayName) {
      await updateRoleDisplayName(props.role.guid, formData.value.displayName)
    }
    if (formData.value.description !== props.role.description) {
      await updateRoleDescription(props.role.guid, formData.value.description || undefined)
    }
    if (formData.value.isAdmin !== props.role.isAdmin) {
      await updateRoleAdminFlag(props.role.guid, formData.value.isAdmin)
    }
    emit('updated')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update role'
  }
}
</script>

<style scoped>
.edit-role-form {
  width: 100%;
}

.edit-role-form h3 {
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



