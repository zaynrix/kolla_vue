<!--
  ObjectiveListContainer - Container Component (Smart Component)
  Handles state, business logic, and data fetching
  Uses ViewModel composables and delegates presentation to Presenter
-->
<template>
  <div class="objective-list-container">
    <div v-if="loading" class="objective-list-container__loading">
      Loading objectives...
    </div>

    <div v-else-if="error" class="objective-list-container__error">
      Error: {{ error.message }}
    </div>

    <ObjectiveList
      v-else
      :objectives="displayedObjectives"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <!-- Strategy pattern: Can inject different renderers -->
      <template #renderer="{ objectives, onEdit, onDelete }">
        <slot
          name="renderer"
          :objectives="objectives"
          :on-edit="onEdit"
          :on-delete="onDelete"
        >
          <!-- Default: Use card renderer -->
          <ObjectiveCard
            v-for="objective in objectives"
            :key="objective.id"
            :objective="objective"
            :priority="getPriorityForObjective(objective)"
            :is-urgent="isUrgentObjective(objective)"
            :is-deadline-approaching="isDeadlineApproachingObjective(objective)"
            @edit="onEdit"
            @delete="onDelete"
          />
        </slot>
      </template>

      <template #empty>
        <slot name="empty">No objectives found</slot>
      </template>
    </ObjectiveList>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useObjective } from '@/composables/useObjective'
import { usePriority } from '@/composables/usePriority'
import ObjectiveList from '@/components/presenters/ObjectiveList.vue'
import ObjectiveCard from '@/components/presenters/ObjectiveCard.vue'
import type { Objective, Priority } from '@/types/domain'

interface Props {
  workflowId?: string
  priorityFilter?: Priority
  showPrioritized?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPrioritized: false,
})

const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

// ViewModel layer - business logic
const {
  objectives,
  loading,
  error,
  loadObjectives,
  loadObjectivesByWorkflow,
  prioritizedObjectives,
  filterByPriority,
  objectivesByWorkflow,
} = useObjective()

// Computed objectives based on filters
const displayedObjectives = computed(() => {
  let result: Objective[] = []

  if (props.workflowId) {
    result = objectivesByWorkflow(props.workflowId).value
  } else {
    result = objectives.value
  }

  if (props.priorityFilter) {
    result = filterByPriority(props.priorityFilter).value.filter((obj) =>
      props.workflowId ? obj.workflowId === props.workflowId : true
    )
  }

  if (props.showPrioritized) {
    // Use prioritized view
    return prioritizedObjectives.value.filter((obj) =>
      props.workflowId ? obj.workflowId === props.workflowId : true
    )
  }

  return result
})

// Load data on mount
onMounted(async () => {
  try {
    if (props.workflowId) {
      await loadObjectivesByWorkflow(props.workflowId)
    } else {
      await loadObjectives()
    }
  } catch (err) {
    console.error('Failed to load objectives:', err)
  }
})

// Priority helpers
function getPriorityForObjective(objective: Objective): Priority {
  const objectiveRef = computed(() => objective)
  const { calculatedPriority } = usePriority(objectiveRef)
  return calculatedPriority.value
}

function isUrgentObjective(objective: Objective): boolean {
  const objectiveRef = computed(() => objective)
  const { isUrgent } = usePriority(objectiveRef)
  return isUrgent.value
}

function isDeadlineApproachingObjective(objective: Objective): boolean {
  const objectiveRef = computed(() => objective)
  const { isDeadlineApproaching } = usePriority(objectiveRef)
  return isDeadlineApproaching.value
}

// Event handlers
function handleEdit(id: string) {
  emit('edit', id)
}

function handleDelete(id: string) {
  emit('delete', id)
}
</script>

<style scoped>
.objective-list-container {
  width: 100%;
}

.objective-list-container__loading,
.objective-list-container__error {
  padding: 2rem;
  text-align: center;
}

.objective-list-container__error {
  color: #f44336;
}
</style>






