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
        :class="['workstep-card__priority', `priority--${priority.toLowerCase().replace('_', '-')}`]"
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

          <div v-if="workStep.deadlineDate" class="workstep-card__deadline">
            <svg class="deadline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="deadline-label">Deadline:</span>
            <span class="deadline-date">{{ formatDeadline(workStep.deadlineDate) }}</span>
          </div>

          <div v-if="workflowDeadline" class="workstep-card__deadline workstep-card__deadline--workflow">
            <svg class="deadline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="deadline-label">Workflow Deadline:</span>
            <span class="deadline-date">{{ formattedWorkflowDeadline }}</span>
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
        <button @click="$emit('view', workStep.id)" class="btn btn--secondary">View</button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkStep } from '@/types/domain'
import { Priority } from '@/types/domain'

interface Props {
  workStep: WorkStep
  priority: Priority
  isUrgent?: boolean
  isDeadlineApproaching?: boolean
  assignedUserName?: string
  assignedUsersMap?: Map<string, string> // Map of user IDs to usernames
  workflowDeadline?: Date // Workflow deadline
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
  const labels: Record<Priority, string> = {
    [Priority.SHORT_TERM]: 'Sofort',
    [Priority.MID_TERM]: 'Mittelfristig',
    [Priority.LONG_TERM]: 'Langfristig',
  }
  return labels[props.priority] || String(props.priority)
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

const formattedWorkflowDeadline = computed(() => {
  if (!props.workflowDeadline) return ''
  return new Date(props.workflowDeadline).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

function formatDeadline(deadline: Date | string): string {
  const d = typeof deadline === 'string' ? new Date(deadline) : deadline
  return d.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.workstep-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 0;
  background: var(--color-surface);
  transition: box-shadow 0.2s, border-color 0.2s;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: visible;
}

.workstep-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-light);
}

.workstep-card--urgent {
  border-left: 4px solid var(--color-error);
}

.workstep-card--approaching {
  border-left: 4px solid var(--color-warning);
}

.workstep-card--completed {
  opacity: 0.7;
  background: var(--color-surface-hover);
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
  color: var(--color-text-primary, #1a1a1a);
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
}

.workstep-card__sequence {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #666);
}

.workstep-card__priority {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.priority--short-term,
.priority--short_term {
  background: var(--color-error-light);
  color: var(--color-error);
}

.priority--mid-term,
.priority--mid_term {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.priority--long-term,
.priority--long_term {
  background: var(--color-info-light);
  color: var(--color-info);
}

.workstep-card__description {
  color: var(--color-text-primary, #1a1a1a);
  margin: 0.5rem 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;
  flex: 1;
  overflow: visible;
  max-height: none;
}

.workstep-card__meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: var(--color-text-primary, #1a1a1a);
  margin: 0.5rem 0;
  align-items: center;
}

.workstep-card__status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.status--pending {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.status--in_progress {
  background: var(--color-info-light);
  color: var(--color-info);
}

.status--completed {
  background: var(--color-success-light);
  color: var(--color-success);
}

.workstep-card__assigned {
  font-size: 0.875rem;
  color: var(--color-text-primary, #1a1a1a);
  margin: 0.5rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
  padding: 0.5rem;
  background: var(--color-surface, #f5f5f5);
  border-radius: var(--radius-sm, 4px);
}

.assigned-label {
  font-weight: 600;
  color: var(--color-text-primary, #1a1a1a);
}

.assigned-users {
  color: var(--color-primary, #2563eb);
  font-weight: 500;
}

.workstep-card__deadline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-error);
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: var(--color-error-light);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md, 6px);
  font-weight: 500;
  opacity: 0.8;
}

.workstep-card__deadline--workflow {
  background: var(--color-info-light);
  border-color: var(--color-info);
  color: var(--color-info);
  opacity: 0.8;
}

.deadline-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.deadline-label {
  font-weight: 600;
}

.deadline-date {
  font-weight: 700;
}

.workstep-card__actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: auto;
  padding-top: var(--spacing-md);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
}

.btn:hover {
  background: var(--color-surface-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn--small {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-xs);
  min-height: 28px;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.btn--primary:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

.btn--secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.btn--secondary:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary-light);
}

.btn--danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.btn--danger:hover {
  background: #c82333;
  border-color: #bd2130;
}
</style>

