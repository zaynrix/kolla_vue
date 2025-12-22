<!--
  UserSelector - Presenter Component
  Allows selecting different actors/users to view their work steps
-->
<template>
  <div class="user-selector">
    <label v-if="showLabel" class="selector-label">{{ label }}</label>
    <select
      :value="selectedUserId"
      @change="handleChange"
      class="selector-select"
      :class="{ 'selector-select--mobile': isMobile }"
    >
      <option value="">-- Select User --</option>
      <option
        v-for="user in users"
        :key="user.id"
        :value="user.id"
      >
        {{ user.username }} ({{ user.role }})
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types/domain'

interface Props {
  users: User[]
  selectedUserId?: string
  label?: string
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Select Actor',
  showLabel: true,
})

const emit = defineEmits<{
  'update:selectedUserId': [userId: string]
  change: [userId: string]
}>()

const isMobile = computed(() => {
  return window.innerWidth < 768
})

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const userId = target.value
  emit('update:selectedUserId', userId)
  emit('change', userId)
}
</script>

<style scoped>
.user-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selector-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

.selector-select {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
  min-width: 200px;
  font-weight: var(--font-medium);
  box-shadow: var(--shadow-sm);
}

.selector-select:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.selector-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.selector-select--mobile {
  width: 100%;
  min-width: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .user-selector {
    width: 100%;
  }

  .selector-select {
    width: 100%;
    min-width: auto;
  }
}
</style>

