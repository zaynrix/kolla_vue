<!--
  EditActorForm - Container Component
  Form for editing existing actors
-->
<template>
  <div class="edit-actor-form">
    <h3>Edit Actor</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="edit-actor-nickname" class="form-label">Nickname *</label>
        <input
          id="edit-actor-nickname"
          v-model="formData.nickname"
          type="text"
          class="form-input"
          required
        />
      </div>

      <div class="form-group">
        <label for="edit-actor-role" class="form-label">Role</label>
        <select
          id="edit-actor-role"
          v-model="formData.roleGuid"
          class="form-select"
        >
          <option value="">No role assigned</option>
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

const { updateActorNickname, updateActorRole, loading } = useActor()
const { roles, loadRoles } = useRole()

const formData = ref({
  nickname: props.actor.nickname,
  roleGuid: props.actor.roleGuid || '',
})

const error = ref<string | null>(null)

onMounted(async () => {
  await loadRoles()
})

watch(
  () => props.actor,
  (newActor) => {
    formData.value = {
      nickname: newActor.nickname,
      roleGuid: newActor.roleGuid || '',
    }
  },
  { immediate: true }
)

async function handleSubmit() {
  error.value = null
  try {
    // Update each field separately (as per backend API design)
    if (formData.value.nickname !== props.actor.nickname) {
      await updateActorNickname(props.actor.guid, formData.value.nickname)
    }
    const newRoleGuid = formData.value.roleGuid || undefined
    if (newRoleGuid !== props.actor.roleGuid) {
      await updateActorRole(props.actor.guid, newRoleGuid)
    }
    emit('updated')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update actor'
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




