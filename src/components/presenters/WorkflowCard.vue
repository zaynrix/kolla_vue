<!--
  WorkflowCard - Presenter Component (Dumb Component)
  Pure presentation component for workflow display
-->
<template>
  <div class="workflow-card">
    <div class="workflow-card__header">
      <h3 class="workflow-card__title">{{ workflow.name }}</h3>
      <span class="workflow-card__objective-count">
        {{ workflow.objectives.length }} Objectives
      </span>
    </div>

    <p v-if="workflow.description" class="workflow-card__description">
      {{ workflow.description }}
    </p>

    <div class="workflow-card__meta">
      <span class="workflow-card__created">
        Created: {{ formattedCreatedAt }}
      </span>
    </div>

    <div class="workflow-card__actions">
      <slot name="actions" :workflow="workflow">
        <button @click="$emit('view', workflow.id)" class="action-btn action-btn--view">View</button>
        <button @click="$emit('edit', workflow.id)" class="action-btn action-btn--edit">Edit</button>
        <button @click="$emit('delete', workflow.id)" class="action-btn action-btn--delete">Delete</button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Workflow } from '@/types/domain'

interface Props {
  workflow: Workflow
}

const props = defineProps<Props>()

defineEmits<{
  view: [id: string]
  edit: [id: string]
  delete: [id: string]
}>()

const formattedCreatedAt = computed(() => {
  return new Date(props.workflow.createdAt).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})
</script>

<style scoped>
.workflow-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: white;
  transition: box-shadow 0.2s;
}

.workflow-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.workflow-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.workflow-card__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.workflow-card__objective-count {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: #e3f2fd;
  color: #1565c0;
  font-size: 0.875rem;
  font-weight: 600;
}

.workflow-card__description {
  color: #666;
  margin: 0.5rem 0;
}

.workflow-card__meta {
  font-size: 0.875rem;
  color: #888;
  margin: 0.5rem 0;
}

.workflow-card__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn--view {
  color: #2563eb;
  border-color: #2563eb;
}

.action-btn--view:hover {
  background: #2563eb;
  color: white;
}

.action-btn--edit {
  color: #16a34a;
  border-color: #16a34a;
}

.action-btn--edit:hover {
  background: #16a34a;
  color: white;
}

.action-btn--delete {
  color: #dc3545;
  border-color: #dc3545;
}

.action-btn--delete:hover {
  background: #dc3545;
  color: white;
}
</style>

