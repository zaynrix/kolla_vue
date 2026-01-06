<!--
  ReassignWorkStepModal - Modal to reassign work step to other actors
-->
<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Reassign Work Step</h2>
        <button @click="handleClose" class="btn-close">×</button>
      </div>
      
      <div v-if="workStep" class="modal-body">
        <div class="workstep-info">
          <h3>{{ workStep.title }}</h3>
          <p v-if="workStep.description" class="workstep-description">{{ workStep.description }}</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">Select User(s) to Assign</label>
          <div class="actors-list">
            <div
              v-for="actor in availableActors"
              :key="actor.guid"
              class="actor-checkbox"
            >
              <input
                :id="`actor-${actor.guid}`"
                type="checkbox"
                :value="actor.guid"
                v-model="selectedActorIds"
                class="checkbox-input"
              />
              <label :for="`actor-${actor.guid}`" class="checkbox-label">
                <span class="actor-name">{{ actor.displayName }}</span>
                <span v-if="actor.role" class="actor-role">
                  {{ actor.role.isAdmin ? 'Admin' : 'Team Member' }}
                </span>
              </label>
            </div>
            <p v-if="availableActors.length === 0" class="no-actors">
              No users available.
            </p>
          </div>
        </div>
        
        <div v-if="error" class="form-error">
          {{ error }}
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="handleClose" class="btn btn--secondary">Cancel</button>
        <button
          @click="handleReassign"
          :disabled="loading || selectedActorIds.length === 0"
          class="btn btn--primary"
        >
          <span v-if="loading">Reassigning...</span>
          <span v-else>Reassign</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useWorkStep } from '@/composables/useWorkStep'
import { useActor } from '@/composables/useActor'
import type { WorkStep } from '@/types/domain'

interface Props {
  show: boolean
  workStep: WorkStep | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  reassigned: [workStepId: string]
}>()

const { updateWorkStep, loading } = useWorkStep()
const { actors, loadActors } = useActor()

const selectedActorIds = ref<string[]>([])
const error = ref<string | null>(null)

const availableActors = computed(() => {
  return actors.value
})

// Initialize selected actors from work step
watch(
  () => props.workStep,
  (workStep) => {
    if (workStep?.assignedTo) {
      selectedActorIds.value = Array.isArray(workStep.assignedTo)
        ? [...workStep.assignedTo]
        : [workStep.assignedTo]
    } else {
      selectedActorIds.value = []
    }
    error.value = null
  },
  { immediate: true }
)

// Load actors when modal opens
watch(
  () => props.show,
  async (show) => {
    if (show) {
      await loadActors()
    }
  }
)

async function handleReassign() {
  if (!props.workStep) return
  
  error.value = null
  
  try {
    // Convert to array or single string
    const assignedTo = selectedActorIds.value.length === 1
      ? selectedActorIds.value[0]
      : selectedActorIds.value.length > 1
      ? [...selectedActorIds.value]
      : undefined
    
    await updateWorkStep(props.workStep.id, {
      assignedTo,
    })
    
    emit('reassigned', props.workStep.id)
    handleClose()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to reassign work step'
  }
}

function handleClose() {
  selectedActorIds.value = []
  error.value = null
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
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

.modal-body {
  padding: var(--spacing-xl);
  flex: 1;
  overflow-y: auto;
}

.workstep-info {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.workstep-info h3 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.workstep-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-label {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
}

.actors-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 300px;
  overflow-y: auto;
  padding: var(--spacing-sm);
  background: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.actor-checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: background var(--transition-base);
}

.actor-checkbox:hover {
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
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.actor-name {
  font-weight: var(--font-medium);
}

.actor-role {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.no-actors {
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
  margin-top: var(--spacing-md);
}

.modal-footer {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
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

