<!--
  AssignmentCard - Presenter Component
  Displays an assignment (task/work item) assigned to an actor
-->
<template>
  <div
    :class="[
      'assignment-card',
      {
        'assignment-card--completed': isCompleted,
        'assignment-card--in-progress': isInProgress,
        'assignment-card--planned': isPlanned,
      },
    ]"
  >
    <div class="assignment-card__header">
      <h3 class="assignment-card__title">{{ assignment.displayName }}</h3>
      <span :class="['assignment-card__status', `status--${statusLabel.toLowerCase()}`]">
        {{ statusLabel }}
      </span>
    </div>

    <p v-if="assignment.description" class="assignment-card__description">
      {{ assignment.description }}
    </p>

    <div class="assignment-card__meta">
      <div v-if="assignment.startDate" class="meta-item">
        <span class="meta-label">Start:</span>
        <span class="meta-value">{{ formatDate(assignment.startDate) }}</span>
      </div>
      <div v-if="assignment.deadlineDate" class="meta-item">
        <span class="meta-label">Deadline:</span>
        <span class="meta-value" :class="{ 'meta-value--overdue': isOverdue }">
          {{ formatDate(assignment.deadlineDate) }}
        </span>
      </div>
      <div v-if="assignment.endDate" class="meta-item">
        <span class="meta-label">Completed:</span>
        <span class="meta-value">{{ formatDate(assignment.endDate) }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Priority:</span>
        <span :class="['meta-value', `priority--${priorityLabel.toLowerCase()}`]">
          {{ priorityLabel }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AssignmentDto } from '@/types/api'

interface Props {
  assignment: AssignmentDto
}

const props = defineProps<Props>()

// Status mapping: 0=Planned, 1=InProgress, 2=Completed
const statusLabel = computed(() => {
  const statusMap: Record<number, string> = {
    0: 'Planned',
    1: 'In Progress',
    2: 'Completed',
  }
  return statusMap[props.assignment.status] || 'Unknown'
})

const isCompleted = computed(() => props.assignment.status === 2)
const isInProgress = computed(() => props.assignment.status === 1)
const isPlanned = computed(() => props.assignment.status === 0)

// Priority mapping: 0=ShortTerm, 1=MidTerm, 2=LongTerm
const priorityLabel = computed(() => {
  const priorityMap: Record<number, string> = {
    0: 'Short Term',
    1: 'Mid Term',
    2: 'Long Term',
  }
  return priorityMap[props.assignment.priority] || 'Unknown'
})

const isOverdue = computed(() => {
  if (!props.assignment.deadlineDate || isCompleted.value) return false
  const deadline = new Date(props.assignment.deadlineDate)
  const now = new Date()
  return deadline < now
})

function formatDate(dateString: string): string {
  try {
    // Handle ISO format: "2026-01-01T12:00:00+00:00" or "2026-01-01T12:00:00Z"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString // Return original if invalid
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}
</script>

<style scoped>
.assignment-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.assignment-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.assignment-card--completed {
  opacity: 0.7;
  background: var(--color-surface-hover);
}

.assignment-card--in-progress {
  border-left: 4px solid var(--color-primary);
}

.assignment-card--planned {
  border-left: 4px solid var(--color-secondary);
}

.assignment-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-md);
}

.assignment-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.assignment-card__status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  white-space: nowrap;
}

.status--planned {
  background: var(--color-secondary-light);
  color: var(--color-secondary-dark);
}

.status--in-progress {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.status--completed {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.assignment-card__description {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.6;
}

.assignment-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-medium);
}

.meta-value {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-semibold);
}

.meta-value--overdue {
  color: var(--color-danger);
}

.priority--short-term {
  color: var(--color-danger);
}

.priority--mid-term {
  color: var(--color-warning);
}

.priority--long-term {
  color: var(--color-success);
}
</style>

