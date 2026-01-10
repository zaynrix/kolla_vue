<!--
  EditActorForm - Container Component
  Form for editing existing actors
-->
<template>
  <div class="edit-actor-form">
    <h3>Edit User</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="edit-actor-displayName" class="form-label">Display Name *</label>
        <input
          id="edit-actor-displayName"
          v-model="formData.displayName"
          type="text"
          class="form-input"
          required
        />
      </div>

      <div class="form-group">
        <label for="edit-actor-role" class="form-label">Role *</label>
        <select
          id="edit-actor-role"
          v-model="formData.roleGuid"
          class="form-select"
          required
        >
          <option value="">Select a role</option>
          <option v-for="role in roles" :key="role.guid" :value="role.guid">
            {{ role.displayName }}
          </option>
        </select>
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
import { ref, watch, onMounted } from 'vue'
import { useActor } from '@/composables/useActor'
import { useRole } from '@/composables/useRole'
import type { ActorDto } from '@/types/api'

interface Props {
  actor: ActorDto
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: []
  cancel: []
}>()

const { updateActorDisplayName, updateActorRole, loading } = useActor()
const { roles, loadRoles } = useRole()

const formData = ref({
  displayName: props.actor.displayName,
  roleGuid: props.actor.role?.guid || '',
})

const error = ref<string | null>(null)

onMounted(async () => {
  await loadRoles()
})

watch(
  () => props.actor,
  (newActor) => {
    formData.value = {
      displayName: newActor.displayName,
      roleGuid: newActor.role?.guid || '',
    }
  },
  { immediate: true }
)

async function handleSubmit() {
  error.value = null
  try {
    // Validate display name
    if (!formData.value.displayName || formData.value.displayName.trim() === '') {
      error.value = 'Display Name is required'
      return
    }

    // Validate role is selected
    if (!formData.value.roleGuid || formData.value.roleGuid === '') {
      error.value = 'Role is required'
      return
    }

    // Update each field separately (as per backend API design)
    if (formData.value.displayName.trim() !== props.actor.displayName) {
      await updateActorDisplayName(props.actor.guid, formData.value.displayName.trim())
    }
    const newRoleGuid = formData.value.roleGuid
    const currentRoleGuid = props.actor.role?.guid
    if (newRoleGuid !== currentRoleGuid) {
      await updateActorRole(props.actor.guid, newRoleGuid)
    }
    emit('updated')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update actor'
    console.error('Error updating actor:', err)
  }
}
</script>

<style scoped>
.edit-actor-form {
  width: 100%;
}

.edit-actor-form h3 {
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
.form-select {
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
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
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






