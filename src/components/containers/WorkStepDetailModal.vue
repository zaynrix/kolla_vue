<!--
  WorkStepDetailModal - Modal to view full work step details
-->
<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Work Step Details</h2>
        <button @click="handleClose" class="btn-close">×</button>
      </div>
      
      <div v-if="workStep" class="modal-body">
        <div class="detail-section">
          <h3 class="detail-label">Title</h3>
          <p class="detail-value">{{ workStep.title }}</p>
        </div>
        
        <div v-if="workStep.description" class="detail-section">
          <h3 class="detail-label">Description</h3>
          <p class="detail-value">{{ workStep.description }}</p>
        </div>
        
        <div class="detail-grid">
          <div class="detail-section">
            <h3 class="detail-label">Status</h3>
            <span :class="['status-badge', `status--${workStep.status.toLowerCase().replace('_', '-')}`]">
              {{ workStep.status.replace('_', ' ') }}
            </span>
          </div>
          
          <div class="detail-section">
            <h3 class="detail-label">Priority</h3>
            <span :class="['priority-badge', `priority--${getPriority(workStep).toLowerCase().replace('_', '-')}`]">
              {{ getPriorityLabel(getPriority(workStep)) }}
            </span>
          </div>
          
          <div class="detail-section">
            <h3 class="detail-label">Duration</h3>
            <p class="detail-value">{{ workStep.duration }} hours</p>
          </div>
          
          <div class="detail-section">
            <h3 class="detail-label">Sequence Number</h3>
            <p class="detail-value">{{ workStep.sequenceNumber }}</p>
          </div>
          
          <div class="detail-section">
            <h3 class="detail-label">Required Role</h3>
            <p class="detail-value">{{ workStep.requiredRole }}</p>
          </div>
          
          <div class="detail-section">
            <h3 class="detail-label">Workflow</h3>
            <p class="detail-value">{{ workflowName }}</p>
          </div>
        </div>
        
        <div v-if="hasAssignments" class="detail-section">
          <h3 class="detail-label">Assigned To</h3>
          <div class="assigned-users-list">
            <span
              v-for="userId in assignedUserIds"
              :key="userId"
              class="assigned-user-badge"
            >
              {{ assignedUsersMap.get(userId) || userId }}
            </span>
          </div>
        </div>
        
        <div v-if="workStep.completedAt" class="detail-section">
          <h3 class="detail-label">Completed At</h3>
          <p class="detail-value">{{ formatDate(workStep.completedAt) }}</p>
        </div>
        
        <div class="detail-section">
          <h3 class="detail-label">Created At</h3>
          <p class="detail-value">{{ formatDate(workStep.createdAt) }}</p>
        </div>
        
        <div class="detail-section">
          <h3 class="detail-label">Updated At</h3>
          <p class="detail-value">{{ formatDate(workStep.updatedAt) }}</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <div v-if="isAdmin" class="modal-actions">
          <button @click="handleEdit" class="btn btn--edit" title="Edit Assignment">
            Edit
          </button>
          <button @click="handleReassign" class="btn btn--reassign" title="Reassign Assignment">
            Reassign
          </button>
          <button @click="handleDelete" class="btn btn--delete" title="Delete Assignment">
            Delete
          </button>
        </div>
        <button @click="handleClose" class="btn btn--secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkStep, Priority } from '@/types/domain'
import { Priority as PriorityEnum } from '@/types/domain'

interface Props {
  show: boolean
  workStep: WorkStep | null
  assignedUsersMap?: Map<string, string>
  workflowName?: string
  workflowDeadline?: Date
  isAdmin?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  assignedUsersMap: () => new Map(),
  workflowName: 'Unknown',
  isAdmin: false,
})

const emit = defineEmits<{
  close: []
  edit: []
  reassign: []
  delete: []
}>()

const hasAssignments = computed(() => {
  if (!props.workStep?.assignedTo) return false
  return Array.isArray(props.workStep.assignedTo)
    ? props.workStep.assignedTo.length > 0
    : true
})

const assignedUserIds = computed(() => {
  if (!props.workStep?.assignedTo) return []
  return Array.isArray(props.workStep.assignedTo)
    ? props.workStep.assignedTo
    : [props.workStep.assignedTo]
})

function getPriority(workStep: WorkStep): Priority {
  return workStep.manualPriority || workStep.priority
}

function getPriorityLabel(priority: Priority): string {
  const labels = {
    [PriorityEnum.SHORT_TERM]: 'Short Term',
    [PriorityEnum.MID_TERM]: 'Mid Term',
    [PriorityEnum.LONG_TERM]: 'Long Term',
  }
  return labels[priority] || priority
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString()
}

function formatDeadline(deadline: Date): string {
  return new Date(deadline).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function handleClose() {
  emit('close')
}

function handleEdit() {
  emit('edit')
  handleClose()
}

function handleReassign() {
  emit('reassign')
  handleClose()
}

function handleDelete() {
  emit('delete')
  handleClose()
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
  max-width: 600px;
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

.detail-section {
  margin-bottom: var(--spacing-lg);
}

.detail-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xs) 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: var(--text-base);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.6;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

.status-badge,
.priority-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status--pending {
  background-color: #fff4e6;
  color: #d97706;
}

.status--in-progress {
  background-color: #e6f2ff;
  color: #2563eb;
}

.status--completed {
  background-color: #e6f9e6;
  color: #16a34a;
}

.status--blocked {
  background-color: #fee;
  color: #c33;
}

.priority--short-term {
  background-color: #fee;
  color: #c33;
}

.priority--mid-term {
  background-color: #fff4e6;
  color: #d97706;
}

.priority--long-term {
  background-color: #e6f2ff;
  color: #2563eb;
}

.assigned-users-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.assigned-user-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.deadline-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.deadline-icon {
  width: 18px;
  height: 18px;
  color: #dc2626;
  flex-shrink: 0;
}

.deadline-value {
  color: #dc2626;
  font-weight: 600;
}

.modal-footer {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
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

.btn--secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn--secondary:hover {
  background: var(--color-surface-hover);
}

.btn--edit {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.btn--edit:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.btn--reassign {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.btn--reassign:hover {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.btn--delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn--delete:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}
</style>

