<!--
  WorkStepCard - Presenter Component (Dumb Component)
  Pure presentation component for work step display
-->
<template>
  <div
    :class="[
      'workstep-card',
      {
        'workstep-card--urgent': isUrgent,
        'workstep-card--approaching': isDeadlineApproaching,
        'workstep-card--completed': workStep.status === 'COMPLETED',
      },
    ]"
  >
    <div class="workstep-card__header">
      <div class="workstep-card__title-section">
        <h3 class="workstep-card__title">{{ workStep.title }}</h3>
        <span class="workstep-card__sequence">Step {{ workStep.sequenceNumber }}</span>
      </div>
      <span
        :class="['workstep-card__priority', `priority--${priority.toLowerCase()}`]"
      >
        {{ priorityLabel }}
      </span>
    </div>

    <p v-if="workStep.description" class="workstep-card__description">
      {{ workStep.description }}
    </p>

    <div class="workstep-card__meta">
      <span class="workstep-card__duration">
        Duration: {{ workStep.duration }}h
      </span>
      <span class="workstep-card__status" :class="`status--${workStep.status.toLowerCase()}`">
        {{ workStep.status }}
      </span>
      <span v-if="workStep.requiredRole" class="workstep-card__role">
        Role: {{ workStep.requiredRole }}
      </span>
    </div>

          <div v-if="hasAssignments" class="workstep-card__assigned">
            <span class="assigned-label">Assigned to:</span>
            <span class="assigned-users">{{ assignedUsersText }}</span>
          </div>

    <div class="workstep-card__actions">
      <slot name="actions" :workStep="workStep">
        <button
          v-if="workStep.status !== 'COMPLETED'"
          @click="$emit('complete', workStep.id)"
          class="btn btn--primary"
        >
          Complete
        </button>
        <button @click="$emit('view', workStep.id)">View</button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkStep, Priority } from '@/types/domain'
import { Priority as PriorityEnum } from '@/types/domain'

interface Props {
  workStep: WorkStep
  priority: Priority
  isUrgent?: boolean
  isDeadlineApproaching?: boolean
  assignedUserName?: string
  assignedUsersMap?: Map<string, string> // Map of user IDs to usernames
}

const props = withDefaults(defineProps<Props>(), {
  isUrgent: false,
  isDeadlineApproaching: false,
  assignedUserName: '',
  assignedUsersMap: () => new Map(),
})

defineEmits<{
  complete: [id: string]
  view: [id: string]
}>()

const priorityLabel = computed(() => {
  const labels = {
    [PriorityEnum.IMMEDIATE]: 'Sofort',
    [PriorityEnum.MEDIUM_TERM]: 'Mittelfristig',
    [PriorityEnum.LONG_TERM]: 'Langfristig',
  }
  return labels[props.priority] || props.priority
})

const hasAssignments = computed(() => {
  return props.workStep.assignedTo !== undefined && 
         (Array.isArray(props.workStep.assignedTo) ? props.workStep.assignedTo.length > 0 : true)
})

const assignedUsersText = computed(() => {
  if (!props.workStep.assignedTo) return ''
  
  if (Array.isArray(props.workStep.assignedTo)) {
    if (props.workStep.assignedTo.length === 0) return ''
    const names = props.workStep.assignedTo
      .map((userId) => props.assignedUsersMap?.get(userId) || props.assignedUserName || userId)
      .filter(Boolean)
    return names.length > 0 ? names.join(', ') : ''
  }
  
  // Single assignment (backward compatibility)
  return props.assignedUsersMap?.get(props.workStep.assignedTo) || props.assignedUserName || props.workStep.assignedTo
})
</script>

<style scoped>
.workstep-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: white;
  transition: box-shadow 0.2s;
}

.workstep-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.workstep-card--urgent {
  border-left: 4px solid #f44336;
}

.workstep-card--approaching {
  border-left: 4px solid #ff9800;
}

.workstep-card--completed {
  opacity: 0.7;
  background: #f5f5f5;
}

.workstep-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.workstep-card__title-section {
  flex: 1;
}

.workstep-card__title {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.workstep-card__sequence {
  font-size: 0.75rem;
  color: #666;
}

.workstep-card__priority {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.priority--immediate {
  background: #ffebee;
  color: #c62828;
}

.priority--medium_term {
  background: #fff3e0;
  color: #e65100;
}

.priority--long_term {
  background: #e3f2fd;
  color: #1565c0;
}

.workstep-card__description {
  color: #666;
  margin: 0.5rem 0;
}

.workstep-card__meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: #888;
  margin: 0.5rem 0;
}

.workstep-card__status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.status--pending {
  background: #fff3e0;
  color: #e65100;
}

.status--in_progress {
  background: #e3f2fd;
  color: #1565c0;
}

.status--completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.workstep-card__assigned {
  font-size: 0.875rem;
  color: #666;
  margin: 0.5rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.assigned-label {
  font-weight: 600;
}

.assigned-users {
  color: var(--color-primary);
  font-weight: 500;
}

.workstep-card__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.875rem;
}

.btn:hover {
  background: #f5f5f5;
}

.btn--primary {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.btn--primary:hover {
  background: #1976d2;
}
</style>

