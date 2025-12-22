<!--
  CreateActorForm - Container Component
  Form for creating new actors
-->
<template>
  <div class="create-actor-form">
    <h3>Create New Actor</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="actor-nickname" class="form-label">Nickname *</label>
        <input
          id="actor-nickname"
          v-model="formData.nickname"
          type="text"
          class="form-input"
          required
          placeholder="e.g., john_doe"
        />
      </div>

      <div class="form-group">
        <label for="actor-role" class="form-label">Role (Optional)</label>
        <select
          id="actor-role"
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
          <span v-if="loading">Creating...</span>
          <span v-else>Create Actor</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useActor } from '@/composables/useActor'
import { useRole } from '@/composables/useRole'
import type { CreateActorRequest } from '@/types/api'

const emit = defineEmits<{
  created: []
  cancel: []
}>()

const { createActor, loading } = useActor()
const { roles, loadRoles } = useRole()

const formData = ref<CreateActorRequest>({
  nickname: '',
  roleGuid: undefined,
})

const error = ref<string | null>(null)

onMounted(async () => {
  await loadRoles()
})

async function handleSubmit() {
  error.value = null
  try {
    await createActor({
      nickname: formData.value.nickname,
      roleGuid: formData.value.roleGuid || undefined,
    })
    // Reset form
    formData.value = {
      nickname: '',
      roleGuid: undefined,
    }
    emit('created')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create actor'
  }
}
</script>

<style scoped>
.create-actor-form {
  width: 100%;
}

.create-actor-form h3 {
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



