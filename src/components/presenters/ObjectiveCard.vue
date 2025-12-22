<!--
  ObjectiveCard - Presenter Component (Dumb Component)
  Pure presentation component, receives props and emits events
  No business logic, highly reusable
-->
<template>
  <div
    :class="[
      'objective-card',
      {
        'objective-card--urgent': isUrgent,
        'objective-card--approaching': isDeadlineApproaching,
      },
    ]"
  >
    <div class="objective-card__header">
      <h3 class="objective-card__title">{{ objective.title }}</h3>
      <span
        :class="['objective-card__priority', `priority--${priority.toLowerCase()}`]"
      >
        {{ priority }}
      </span>
    </div>

    <p v-if="objective.description" class="objective-card__description">
      {{ objective.description }}
    </p>

    <div class="objective-card__meta">
      <span class="objective-card__deadline">
        Deadline: {{ formattedDeadline }}
      </span>
      <span class="objective-card__duration">
        Duration: {{ objective.duration }}h
      </span>
    </div>

    <div class="objective-card__actions">
      <slot name="actions" :objective="objective">
        <button @click="$emit('edit', objective.id)">Edit</button>
        <button @click="$emit('delete', objective.id)">Delete</button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Objective, Priority } from '@/types/domain'

interface Props {
  objective: Objective
  priority: Priority
  isUrgent?: boolean
  isDeadlineApproaching?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isUrgent: false,
  isDeadlineApproaching: false,
})

defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

const formattedDeadline = computed(() => {
  return new Date(props.objective.deadline).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<style scoped>
.objective-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: white;
  transition: box-shadow 0.2s;
}

.objective-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.objective-card--urgent {
  border-left: 4px solid #f44336;
}

.objective-card--approaching {
  border-left: 4px solid #ff9800;
}

.objective-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.objective-card__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.objective-card__priority {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
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

.objective-card__description {
  color: #666;
  margin: 0.5rem 0;
}

.objective-card__meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #888;
  margin: 0.5rem 0;
}

.objective-card__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.objective-card__actions button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: background 0.2s;
}

.objective-card__actions button:hover {
  background: #f5f5f5;
}
</style>



