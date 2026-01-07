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
    // Use optimistic status if available, otherwise use actual status
    const displayStatus = optimisticStatus.value.get(ws.id) || ws.status
    return displayStatus === status
  })
}

function getPriority(workStep: WorkStep): Priority {
  // Priority should be calculated based on remaining duration of ALL remaining work steps
  // Use the calculated priority from the store instead of the backend priority
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
  // This would check workflow deadline
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
  
  // Only allow drop if it's a different status
  if (draggedWorkStep.value && draggedWorkStep.value.status !== status) {
    dragOverColumn.value = status
  } else {
    dragOverColumn.value = null
  }
}

function handleDragLeave(status: TaskStatus, event: DragEvent) {
  // Check if we're actually leaving the column (not just entering a child)
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
  
  // Only proceed if status actually changed
  if (oldStatus !== targetStatus) {
    // Optimistically update ONLY this card's status immediately (UI updates instantly)
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
  // Don't trigger select if clicking on select dropdown, buttons, or other interactive elements
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

// Clear optimistic status when actual workStep status updates from store
watch(() => props.workSteps, (newSteps) => {
  newSteps.forEach((step) => {
    const optimistic = optimisticStatus.value.get(step.id)
    if (optimistic !== undefined) {
      // If the store status matches optimistic, clear it (API confirmed)
      if (optimistic === step.status) {
        optimisticStatus.value.delete(step.id)
      }
      // If store status differs from optimistic, keep optimistic until API confirms
      // This handles the case where API hasn't responded yet
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
  border-bottom: 2px solid #f3f4f6;
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
  color: #6b7280;
  background: #f3f4f6;
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
}

.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-track {
  background: transparent;
}

.column-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.column-content--drag-over {
  background-color: rgba(37, 99, 235, 0.08);
  border: 2px dashed #3b82f6;
  border-radius: 8px;
}

.column-empty {
  text-align: center;
  color: #9ca3af;
  padding: 3rem 1rem;
  font-style: italic;
  font-size: 0.875rem;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.board-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 1.5rem;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  border-left: 3px solid #d1d5db;
  position: relative;
  overflow: visible;
  user-select: none;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  touch-action: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 280px;
  height: auto;
  flex-shrink: 0;
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
  background: #d1d5db;
  transition: all 0.2s ease;
}

.board-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #cbd5e1;
}

.board-card:hover::before {
  width: 4px;
  background: var(--color-primary);
}

.card--urgent {
  border-left-color: #ef4444;
  background: linear-gradient(to right, #fef2f2 0%, #ffffff 5%);
}

.card--urgent::before {
  background: #ef4444;
}

.card--approaching {
  border-left-color: #f59e0b;
  background: linear-gradient(to right, #fffbeb 0%, #ffffff 5%);
}

.card--approaching::before {
  background: #f59e0b;
}

.card--completed {
  opacity: 1;
  background: #ffffff;
}

.card--completed::before {
  background: #d1d5db;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.card-sequence {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f3f4f6;
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
  background: #fee2e2;
  color: #991b1b;
}

.priority--mid-term {
  background: #fed7aa;
  color: #92400e;
}

.priority--long-term {
  background: #dbeafe;
  color: #1e40af;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.5;
  word-break: break-word;
  display: block;
  flex-shrink: 0;
}

.card-description {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
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
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
  margin-top: auto;
}

.card-duration {
  font-weight: 600;
  color: #4b5563;
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
  background: #eff6ff;
  color: #1e40af;
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
  background: #fef3c7;
  color: #92400e;
}

.card-deadline {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.5rem;
  padding: 0.375rem 0.5rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  font-weight: 500;
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
  border-top: 1px solid #f3f4f6;
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
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.card-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-action-btn--edit {
  background: rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.2);
  color: #2563eb;
}

.card-action-btn--edit:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.card-action-btn--reassign {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.card-action-btn--reassign:hover {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.card-action-btn--delete {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.card-action-btn--delete:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.status-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  font-size: 0.8125rem;
  color: #111827;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;
}

.status-select:hover {
  border-color: #3b82f6;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
}

.status-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.workflow-assign-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.workflow-assign-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #92400e;
}

.workflow-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  background: #ffffff;
  font-size: 0.8125rem;
  color: #111827;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;
}

.workflow-select:hover {
  border-color: #f59e0b;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.1);
}

.workflow-select:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
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

