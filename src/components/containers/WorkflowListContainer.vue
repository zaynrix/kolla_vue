<!--
  WorkflowListContainer - Container Component (Smart Component)
  Handles workflow state and business logic
-->
<template>
  <div class="workflow-list-container">
    <div v-if="loading" class="workflow-list-container__loading">
      Loading workflows...
    </div>

    <div v-else-if="error" class="workflow-list-container__error">
      Error: {{ error.message }}
    </div>

    <div v-else class="workflow-list-container__content">
      <div v-if="filteredWorkflows.length === 0" class="workflow-list-container__empty">
        <slot name="empty">No workflows found</slot>
      </div>

      <div v-else class="workflow-list-container__list">
        <WorkflowCard
          v-for="workflow in filteredWorkflows"
          :key="workflow.id"
          :workflow="workflow"
          @view="handleView"
          @edit="handleEdit"
          @delete="handleDelete"
        >
          <template #actions="{ workflow }">
            <slot name="actions" :workflow="workflow">
              <button @click="handleView(workflow.id)">View</button>
              <button @click="handleEdit(workflow.id)">Edit</button>
              <button @click="handleDelete(workflow.id)">Delete</button>
            </slot>
          </template>
        </WorkflowCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useWorkflow } from '@/composables/useWorkflow'
import WorkflowCard from '@/components/presenters/WorkflowCard.vue'

interface Props {
  searchTerm?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  view: [id: string]
  edit: [id: string]
  delete: [id: string]
}>()

// ViewModel layer - business logic
const { workflows, loading, error, loadWorkflows, filterWorkflowsByName } =
  useWorkflow()

const searchTermRef = ref(props.searchTerm || '')

// Computed filtered workflows
const filteredWorkflows = computed(() => {
  if (searchTermRef.value) {
    return filterWorkflowsByName(searchTermRef).value
  }
  return workflows.value
})

// Load data on mount
onMounted(async () => {
  try {
    await loadWorkflows()
  } catch (err) {
    console.error('Failed to load workflows:', err)
  }
})

// Event handlers
function handleView(id: string) {
  emit('view', id)
}

function handleEdit(id: string) {
  emit('edit', id)
}

function handleDelete(id: string) {
  emit('delete', id)
}
</script>

<style scoped>
.workflow-list-container {
  width: 100%;
}

.workflow-list-container__loading,
.workflow-list-container__error,
.workflow-list-container__empty {
  padding: 2rem;
  text-align: center;
}

.workflow-list-container__error {
  color: #f44336;
}

.workflow-list-container__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>



