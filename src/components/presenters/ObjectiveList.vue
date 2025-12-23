<!--
  ObjectiveList - Presenter Component (Dumb Component)
  Pure presentation component with Strategy pattern support via slots
  Flexible rendering strategies (table, cards, diagram, etc.)
-->
<template>
  <div class="objective-list">
    <div v-if="objectives.length === 0" class="objective-list__empty">
      <slot name="empty">No objectives found</slot>
    </div>

    <div v-else class="objective-list__content">
      <!-- Strategy pattern: Different renderers can be injected via slot -->
      <slot
        name="renderer"
        :objectives="objectives"
        :on-edit="handleEdit"
        :on-delete="handleDelete"
      >
        <!-- Default renderer: Card view -->
        <ObjectiveCard
          v-for="objective in objectives"
          :key="objective.id"
          :objective="objective"
          :priority="objective.priority"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import ObjectiveCard from './ObjectiveCard.vue'
import type { Objective } from '@/types/domain'

interface Props {
  objectives: Objective[]
}

defineProps<Props>()

const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

function handleEdit(id: string) {
  emit('edit', id)
}

function handleDelete(id: string) {
  emit('delete', id)
}
</script>

<style scoped>
.objective-list {
  width: 100%;
}

.objective-list__empty {
  padding: 2rem;
  text-align: center;
  color: #888;
}

.objective-list__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>




