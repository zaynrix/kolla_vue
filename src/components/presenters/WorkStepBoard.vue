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
        <div
          class="column-content"
          :class="{ 'column-content--drag-over': dragOverColumn === status.key }"
          @dragover.prevent="handleDragOver(status.key, $event)"
          @dragleave="handleDragLeave(status.key, $event)"
          @drop="handleDrop(status.key, $event)"
        >
          <div
            v-for="workStep in getWorkStepsByStatus(status.key)"
            :key="workStep.id"
            class="board-card"
            :class="{
              'card--urgent': isUrgent(workStep),
              'card--approaching': isDeadlineApproaching(workStep),
              'card--dragging': draggedWorkStepId === workStep.id,
              'card--completed': workStep.status === 'COMPLETED',
            }"
            draggable="true"
            @dragstart.stop="handleDragStart(workStep, $event)"
            @dragend="handleDragEnd"
            @click="handleCardClick(workStep, $event)"
            @dblclick="$emit('complete', workStep.id)"
          >
            <div class="card-header">
              <span class="card-sequence">#{{ workStep.sequenceNumber }}</span>
              <span
                :class="['card-priority', `priority--${getPriority(workStep).toLowerCase().replace('_', '-')}`]"
              >
                {{ getPriorityLabel(getPriority(workStep)).toUpperCase() }}
              </span>
            </div>
            <h4 class="card-title">{{ workStep.title || 'Untitled' }}</h4>
            <p v-if="workStep.description" class="card-description">
              {{ truncate(workStep.description, 60) }}
            </p>
            <div class="card-footer">
              <span class="card-duration">{{ workStep.duration || 0 }}h</span>
              <span class="card-assigned" :class="{ 'card-assigned--unassigned': !hasAssignments(workStep) }">
                {{ hasAssignments(workStep) ? getAssignedUsersText(workStep) : 'Unassigned' }}
              </span>
            </div>
            <div v-if="getWorkflowDeadline(workStep.workflowId)" class="card-deadline">
              <svg class="deadline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="deadline-text">{{ formatWorkflowDeadline(getWorkflowDeadline(workStep.workflowId)) }}</span>
            </div>
            <div class="card-actions">
              <select
                :value="optimisticStatus.get(workStep.id) || workStep.status"
                @change="handleStatusChange(workStep, $event)"
                class="status-select"
                @click.stop
                @mousedown.stop
              >
                <option value="PENDING">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Done</option>
              </select>
              
              <!-- Assign Workflow (Admin only, if work step doesn't have workflow) -->
              <div v-if="isAdmin && (!workStep.workflowId || workStep.workflowId === '' || workStep.workflowId === 'default-workflow')" class="workflow-assign-section">
                <label class="workflow-assign-label">Assign to Workflow:</label>
                <select
                  :value="''"
                  @change="handleWorkflowAssign(workStep, $event)"
                  class="workflow-select"
                  @click.stop
                  @mousedown.stop
                >
                  <option value="">Select Workflow</option>
                  <option
                    v-for="workflow in workflows"
                    :key="workflow.id"
                    :value="workflow.id"
                  >
                    {{ workflow.name }}
                  </option>
                </select>
              </div>
              
              <!-- Admin Actions - Always show for admin users -->
              <div v-if="isAdmin" class="card-admin-actions">
                <button
                  @click.stop="handleEdit(workStep.id)"
                  class="card-action-btn card-action-btn--edit"
                  title="Edit"
                  aria-label="Edit work step"
                >
                  Edit
                </button>
                <button
                  @click.stop="handleReassign(workStep.id)"
                  class="card-action-btn card-action-btn--reassign"
                  title="Reassign"
                  aria-label="Reassign work step"
                >
                  Reassign
                </button>
                <button
                  @click.stop="handleDelete(workStep.id)"
                  class="card-action-btn card-action-btn--delete"
                  title="Delete"
                  aria-label="Delete work step"
                >
                  Delete
                </button>
              </div>
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
import { computed, ref, watch } from 'vue'
import { useWorkStepStore } from '@/stores/workStep'
import type { WorkStep, Priority } from '@/types/domain'
import { Priority as PriorityEnum, TaskStatus } from '@/types/domain'

interface Props {
  workSteps: WorkStep[]
  assignedUsers?: Map<string, string>
  isAdmin?: boolean
  workflows?: Array<{ id: string; name: string; deadline?: Date }>
}

const props = withDefaults(defineProps<Props>(), {
  assignedUsers: () => new Map(),
  isAdmin: false,
  workflows: () => [],
})

const emit = defineEmits<{
  select: [workStep: WorkStep]
  complete: [workStepId: string]
  statusChange: [workStepId: string, newStatus: TaskStatus]
  edit: [workStepId: string]
  reassign: [workStepId: string]
  delete: [workStepId: string]
  assignWorkflow: [workStepId: string, workflowId: string]
}>()

const statusColumns = [
  { key: TaskStatus.PENDING, label: 'To Do' },
  { key: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { key: TaskStatus.COMPLETED, label: 'Done' },
]

function getWorkStepsByStatus(status: TaskStatus): WorkStep[] {
  return props.workSteps.filter((ws) => {
    const displayStatus = optimisticStatus.value.get(ws.id) || ws.status
    return displayStatus === status
  })
}

function getPriority(workStep: WorkStep): Priority {
  const workStepStore = useWorkStepStore()
  const now = new Date()
  return workStep.manualPriority || workStepStore.calculatePriority(workStep, now) || PriorityEnum.LONG_TERM
}

function getPriorityLabel(priority: Priority): string {
  const labels = {
    [PriorityEnum.SHORT_TERM]: 'Short Term',
    [PriorityEnum.MID_TERM]: 'Mid Term',
    [PriorityEnum.LONG_TERM]: 'Long Term',
  }
  return labels[priority] || priority
}

function isUrgent(workStep: WorkStep): boolean {
  return getPriority(workStep) === PriorityEnum.SHORT_TERM
}

function isDeadlineApproaching(workStep: WorkStep): boolean {
  
  return false
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function getWorkflowDeadline(workflowId: string): Date | undefined {
  const workflow = props.workflows?.find((w) => w.id === workflowId)
  return workflow?.deadline
}

function formatWorkflowDeadline(deadline: Date | undefined): string {
  if (!deadline) return ''
  return new Date(deadline).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

// Drag and Drop functionality
const draggedWorkStepId = ref<string | null>(null)
const draggedWorkStep = ref<WorkStep | null>(null)
const dragOverColumn = ref<TaskStatus | null>(null)
const optimisticStatus = ref<Map<string, TaskStatus>>(new Map())

function handleDragStart(workStep: WorkStep, event: DragEvent) {
  draggedWorkStepId.value = workStep.id
  draggedWorkStep.value = { ...workStep } // Store a copy
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', workStep.id)
    event.dataTransfer.setData('application/json', JSON.stringify({ id: workStep.id, status: workStep.status }))
  }
  
  // Find the actual card element
  const target = event.target as HTMLElement
  let cardElement: HTMLElement | null = target
  
  // Traverse up to find the board-card
  while (cardElement && !cardElement.classList.contains('board-card')) {
    cardElement = cardElement.parentElement
  }
  
  if (cardElement && event.dataTransfer) {
    const cardWidth = cardElement.offsetWidth || 280
    const cardHeight = cardElement.offsetHeight || 100
    
    // Create a simple drag preview
    const dragPreview = document.createElement('div')
    dragPreview.style.width = `${cardWidth}px`
    dragPreview.style.height = `${cardHeight}px`
    dragPreview.style.background = 'white'
    dragPreview.style.border = '2px solid #2563eb'
    dragPreview.style.borderRadius = '8px'
    dragPreview.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
    dragPreview.style.position = 'absolute'
    dragPreview.style.top = '-1000px'
    dragPreview.style.left = '-1000px'
    dragPreview.style.pointerEvents = 'none'
    dragPreview.textContent = workStep.title
    
    document.body.appendChild(dragPreview)
    event.dataTransfer.setDragImage(dragPreview, cardWidth / 2, 20)
    
    setTimeout(() => {
      if (document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview)
      }
    }, 0)
  }
}

function handleDragOver(status: TaskStatus, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  
  if (draggedWorkStep.value && draggedWorkStep.value.status !== status) {
    dragOverColumn.value = status
  } else {
    dragOverColumn.value = null
  }
}

function handleDragLeave(status: TaskStatus, event: DragEvent) {
  
  const relatedTarget = event.relatedTarget as HTMLElement | null
  const currentTarget = event.currentTarget as HTMLElement | null
  if (!relatedTarget || !currentTarget) {
    if (dragOverColumn.value === status) {
      dragOverColumn.value = null
    }
    return
  }
  if (!currentTarget.contains(relatedTarget)) {
    if (dragOverColumn.value === status) {
      dragOverColumn.value = null
    }
  }
}

function handleDrop(targetStatus: TaskStatus, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  dragOverColumn.value = null
  
  if (!draggedWorkStep.value) return
  
  const workStepId = draggedWorkStep.value.id
  const oldStatus = draggedWorkStep.value.status
  
  if (oldStatus !== targetStatus) {
    optimisticStatus.value.set(workStepId, targetStatus)
    
    // Emit the status change (API call happens in parent)
    emit('statusChange', workStepId, targetStatus)
  }
  
  // Reset drag state
  draggedWorkStepId.value = null
  draggedWorkStep.value = null
}

function handleDragEnd() {
  // Reset drag state
  draggedWorkStepId.value = null
  draggedWorkStep.value = null
  dragOverColumn.value = null
}

function handleCardClick(workStep: WorkStep, event: MouseEvent) {
  const target = event.target as HTMLElement
  if (
    target.tagName === 'SELECT' || 
    target.closest('.status-select') ||
    target.tagName === 'BUTTON' ||
    target.closest('.card-admin-actions') ||
    target.closest('.card-action-btn')
  ) {
    return
  }
  emit('select', workStep)
}

function handleEdit(workStepId: string) {
  emit('edit', workStepId)
}

function handleReassign(workStepId: string) {
  emit('reassign', workStepId)
}

function handleDelete(workStepId: string) {
  emit('delete', workStepId)
}

function handleWorkflowAssign(workStep: WorkStep, event: Event) {
  const target = event.target as HTMLSelectElement
  const workflowId = target.value
  if (workflowId) {
    emit('assignWorkflow', workStep.id, workflowId)
    // Reset select to show placeholder
    target.value = ''
  }
}

watch(() => props.workSteps, (newSteps) => {
  newSteps.forEach((step) => {
    const optimistic = optimisticStatus.value.get(step.id)
    if (optimistic !== undefined) {
      if (optimistic === step.status) {
        optimisticStatus.value.delete(step.id)
      }
      
    }
  })
}, { deep: true })
</script>

<style scoped>
.workstep-board {
  width: 100%;
  overflow-x: auto;
  padding: var(--spacing-xl);
  background: transparent;
  position: relative;
  display: flex;
  justify-content: center;
}

.workstep-board::-webkit-scrollbar {
  height: 8px;
}

.workstep-board::-webkit-scrollbar-track {
  background: var(--color-background);
  border-radius: var(--radius-full);
}

.workstep-board::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-full);
}

.workstep-board::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

.board-columns {
  display: flex;
  gap: var(--spacing-xl);
  min-width: min-content;
  padding: var(--spacing-md);
  align-items: flex-start;
  justify-content: center;
  margin: 0 auto;
}

@media (min-width: 1440px) {
  .board-columns {
    gap: var(--spacing-2xl);
    padding: var(--spacing-lg);
  }
}

.board-column {
  flex: 0 0 auto;
  width: 340px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
  min-height: 600px;
  border: 1px solid var(--color-border);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.board-column::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.board-column:hover {
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: var(--color-primary-light);
}

.board-column:hover::before {
  opacity: 1;
}

@media (min-width: 1440px) {
  .board-column {
    width: 380px;
    max-height: calc(100vh - 180px);
    min-height: 700px;
  }
}

@media (min-width: 1920px) {
  .board-column {
    width: 420px;
  }
}

@media (max-width: 768px) {
  .board-column {
    width: 300px;
    min-width: 280px;
    max-height: calc(100vh - 200px);
    min-height: 500px;
  }
  
  .board-columns {
    gap: var(--spacing-md);
    padding: var(--spacing-sm);
  }
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-border);
  position: relative;
}

.column-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 2px;
}

.column-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.column-count {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-weight: 600;
  min-width: 28px;
  text-align: center;
}

.column-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-height: 500px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
  margin-top: var(--spacing-sm);
  width: 100%;
  box-sizing: border-box;
}

.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-track {
  background: transparent;
}

.column-content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

.column-content--drag-over {
  background-color: var(--color-primary-light);
  border: 2px dashed var(--color-primary);
  border-radius: 8px;
  opacity: 0.5;
}

.column-empty {
  text-align: center;
  color: var(--color-text-tertiary);
  padding: 3rem 1rem;
  font-style: italic;
  font-size: 0.875rem;
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-hover);
}

.board-card {
  background: var(--color-surface);
  border-radius: 10px;
  padding: 1.5rem;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-border);
  position: relative;
  overflow: visible;
  user-select: none;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  touch-action: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 280px;
  height: auto;
  flex-shrink: 0;
  margin: 0;
}

.board-card:active {
  cursor: grabbing;
}

.board-card[draggable="true"] {
  -webkit-user-drag: element;
}

.board-card.card--dragging {
  opacity: 0.5;
  transform: rotate(2deg) scale(0.98);
  cursor: grabbing;
  pointer-events: none;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.drag-preview {
  z-index: 9999;
}

.board-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-border);
  transition: all 0.2s ease;
}

.board-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--color-primary-light);
}

.board-card:hover::before {
  width: 4px;
  background: var(--color-primary);
}

.card--urgent {
  border-left-color: var(--color-error);
  background: var(--color-surface);
}

.card--urgent::before {
  background: var(--color-error);
}

.card--approaching {
  border-left-color: var(--color-warning);
  background: var(--color-surface);
}

.card--approaching::before {
  background: var(--color-warning);
}

.card--completed {
  opacity: 0.8;
  background: var(--color-surface-hover);
}

.card--completed::before {
  background: var(--color-border);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.card-sequence {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', monospace;
  background: var(--color-surface-hover);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.card-priority {
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority--short-term {
  background: var(--color-error-light);
  color: var(--color-error);
}

.priority--mid-term {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.priority--long-term {
  background: var(--color-info-light);
  color: var(--color-info);
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.5;
  word-break: break-word;
  display: block;
  flex-shrink: 0;
}

.card-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  word-break: break-word;
  flex: 1 1 auto;
  min-height: 2.4em;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
  margin-top: auto;
}

.card-duration {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.card-duration::before {
  content: '⏱';
  font-size: 0.875rem;
  opacity: 0.7;
}

.card-assigned {
  background: var(--color-info-light);
  color: var(--color-info);
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.card-assigned--unassigned {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.card-deadline {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-error);
  margin-top: 0.5rem;
  padding: 0.375rem 0.5rem;
  background: var(--color-error-light);
  border: 1px solid var(--color-error);
  border-radius: 4px;
  font-weight: 500;
  opacity: 0.8;
}

.deadline-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.deadline-text {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
}

.card-admin-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.card-action-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  white-space: nowrap;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.card-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-action-btn--edit {
  background: var(--color-info-light);
  border-color: var(--color-info);
  color: var(--color-info);
}

.card-action-btn--edit:hover {
  background: var(--color-info);
  color: var(--color-text-inverse);
  border-color: var(--color-info);
}

.card-action-btn--reassign {
  background: var(--color-success-light);
  border-color: var(--color-success);
  color: var(--color-success);
}

.card-action-btn--reassign:hover {
  background: var(--color-success);
  color: var(--color-text-inverse);
  border-color: var(--color-success);
}

.card-action-btn--delete {
  background: var(--color-error-light);
  border-color: var(--color-error);
  color: var(--color-error);
}

.card-action-btn--delete:hover {
  background: var(--color-error);
  color: var(--color-text-inverse);
  border-color: var(--color-error);
}

.status-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  font-size: 0.8125rem;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;
}

.status-select:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.status-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.workflow-assign-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-warning-light);
  border: 1px solid var(--color-warning);
  border-radius: 6px;
  margin-top: 0.5rem;
}

.workflow-assign-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-warning);
}

.workflow-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-warning);
  border-radius: 6px;
  background: var(--color-surface);
  font-size: 0.8125rem;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;
}

.workflow-select:hover {
  border-color: var(--color-warning);
  box-shadow: var(--shadow-sm);
}

.workflow-select:focus {
  outline: none;
  border-color: var(--color-warning);
  box-shadow: 0 0 0 3px var(--color-warning-light);
}

/* Responsive */
@media (max-width: 768px) {
  .workstep-board {
    padding: 1rem 0;
  }

  .board-columns {
    flex-direction: column;
    padding: 0;
    gap: 1rem;
  }

  .board-column {
    min-width: 100%;
    max-width: 100%;
    max-height: 500px;
  }

  .column-content {
    max-height: 400px;
  }
}

@media (max-width: 480px) {
  .workstep-board {
    padding: 0.75rem 0;
  }

  .board-column {
    padding: 1rem;
    min-width: 100%;
  }

  .board-card {
    padding: 0.875rem;
  }

  .card-title {
    font-size: 0.875rem;
  }

  .card-description {
    font-size: 0.75rem;
  }
}
</style>

