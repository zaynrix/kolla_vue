<!--
  WorkStepBoard - Trello/Jira-style Board Component
  Presenter Component for Kanban-style work step visualization
-->
<template>
  <div class="workstep-board">
    <div class="board-columns">
      <div
        v-for="status in statusColumns"
        :key="status.key"
        class="board-column"
        :class="`column--${status.key.toLowerCase()}`"
      >
        <div class="column-header">
          <h3 class="column-title">{{ status.label }}</h3>
          <span class="column-count">({{ getWorkStepsByStatus(status.key).length }})</span>
        </div>
        <div class="column-content">
          <div
            v-for="workStep in getWorkStepsByStatus(status.key)"
            :key="workStep.id"
            class="board-card"
            :class="{
              'card--urgent': isUrgent(workStep),
              'card--approaching': isDeadlineApproaching(workStep),
            }"
            @click="$emit('select', workStep)"
            @dblclick="$emit('complete', workStep.id)"
          >
            <div class="card-header">
              <span class="card-sequence">#{{ workStep.sequenceNumber }}</span>
              <span
                :class="['card-priority', `priority--${getPriority(workStep).toLowerCase()}`]"
              >
                {{ getPriorityLabel(getPriority(workStep)) }}
              </span>
            </div>
            <h4 class="card-title">{{ workStep.title }}</h4>
            <p v-if="workStep.description" class="card-description">
              {{ truncate(workStep.description, 60) }}
            </p>
            <div class="card-footer">
              <span class="card-duration">{{ workStep.duration }}h</span>
                    <span v-if="hasAssignments(workStep)" class="card-assigned">
                      {{ getAssignedUsersText(workStep) }}
                    </span>
            </div>
            <div class="card-actions">
              <select
                :value="workStep.status"
                @change="handleStatusChange(workStep, $event)"
                class="status-select"
                @click.stop
              >
                <option value="PENDING">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Done</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>
          <div v-if="getWorkStepsByStatus(status.key).length === 0" class="column-empty">
            No work steps
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkStep, Priority } from '@/types/domain'
import { Priority as PriorityEnum, TaskStatus } from '@/types/domain'

interface Props {
  workSteps: WorkStep[]
  assignedUsers?: Map<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  assignedUsers: () => new Map(),
})

const emit = defineEmits<{
  select: [workStep: WorkStep]
  complete: [workStepId: string]
  statusChange: [workStepId: string, newStatus: TaskStatus]
}>()

const statusColumns = [
  { key: TaskStatus.PENDING, label: 'To Do' },
  { key: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { key: TaskStatus.COMPLETED, label: 'Done' },
  { key: TaskStatus.BLOCKED, label: 'Blocked' },
]

function getWorkStepsByStatus(status: TaskStatus): WorkStep[] {
  return props.workSteps.filter((ws) => ws.status === status)
}

function getPriority(workStep: WorkStep): Priority {
  return workStep.manualPriority || workStep.priority || PriorityEnum.LONG_TERM
}

function getPriorityLabel(priority: Priority): string {
  const labels = {
    [PriorityEnum.IMMEDIATE]: 'Sofort',
    [PriorityEnum.MEDIUM_TERM]: 'Mittelfristig',
    [PriorityEnum.LONG_TERM]: 'Langfristig',
  }
  return labels[priority] || priority
}

function isUrgent(workStep: WorkStep): boolean {
  return getPriority(workStep) === PriorityEnum.IMMEDIATE
}

function isDeadlineApproaching(workStep: WorkStep): boolean {
  // This would check workflow deadline
  return false
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function hasAssignments(workStep: WorkStep): boolean {
  return workStep.assignedTo !== undefined && 
         (Array.isArray(workStep.assignedTo) ? workStep.assignedTo.length > 0 : true)
}

function getAssignedUsersText(workStep: WorkStep): string {
  if (!workStep.assignedTo) return ''
  
  if (Array.isArray(workStep.assignedTo)) {
    if (workStep.assignedTo.length === 0) return ''
    const names = workStep.assignedTo
      .map((userId) => props.assignedUsers?.get(userId) || userId)
      .filter(Boolean)
    return names.length > 0 ? names.join(', ') : ''
  }
  
  // Single assignment (backward compatibility)
  return props.assignedUsers?.get(workStep.assignedTo) || workStep.assignedTo
}

function handleStatusChange(workStep: WorkStep, event: Event) {
  const target = event.target as HTMLSelectElement
  const newStatus = target.value as TaskStatus
  emit('statusChange', workStep.id, newStatus)
}
</script>

<style scoped>
.workstep-board {
  width: 100%;
  overflow-x: auto;
  padding: 1rem 0;
}

.board-columns {
  display: flex;
  gap: 1rem;
  min-width: min-content;
  padding: 0 1rem;
}

.board-column {
  flex: 1;
  min-width: 280px;
  max-width: 400px;
  background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-background) 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-md);
}

@media (min-width: 1440px) {
  .board-column {
    max-width: 450px;
  }
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-border);
}

.column-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.column-count {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: var(--color-surface);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-sm);
}

.column-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.column-empty {
  text-align: center;
  color: #999;
  padding: 2rem 1rem;
  font-style: italic;
}

.board-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
  border-left: 4px solid transparent;
  border: 1px solid var(--color-border-light);
  margin-bottom: var(--spacing-md);
  position: relative;
  overflow: hidden;
}

.board-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--color-border);
  transition: width var(--transition-base);
}

.board-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
  border-color: var(--color-primary-light);
}

.board-card:hover::before {
  width: 6px;
  background: var(--color-primary);
}

.card--urgent {
  border-left-color: var(--color-priority-immediate);
}

.card--urgent::before {
  background: var(--color-priority-immediate);
}

.card--approaching {
  border-left-color: var(--color-priority-medium);
}

.card--approaching::before {
  background: var(--color-priority-medium);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.card-sequence {
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
}

.card-priority {
  padding: 0.125rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority--immediate {
  background: var(--color-priority-immediate-light);
  color: var(--color-priority-immediate);
}

.priority--medium_term {
  background: var(--color-priority-medium-light);
  color: var(--color-priority-medium);
}

.priority--long_term {
  background: var(--color-priority-long-light);
  color: var(--color-priority-long);
}

.card-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.card-description {
  margin: 0 0 0.75rem 0;
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #888;
}

.card-duration {
  font-weight: 600;
}

.card-assigned {
  background: #e3f2fd;
  color: #1565c0;
  padding: 0.125rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
}

.card-actions {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
}

.status-select {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.status-select:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.status-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .board-columns {
    flex-direction: column;
    padding: 0 0.5rem;
  }

  .board-column {
    min-width: 100%;
    max-width: 100%;
    max-height: none;
  }

  .column-content {
    max-height: 300px;
  }
}

@media (max-width: 480px) {
  .workstep-board {
    padding: 0.5rem 0;
  }

  .board-column {
    padding: 0.75rem;
  }

  .board-card {
    padding: 0.75rem;
  }

  .card-title {
    font-size: 0.85rem;
  }
}
</style>

