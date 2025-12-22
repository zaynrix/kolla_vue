<!--
  NotificationBadge - Presenter Component
  Shows notification count badge
-->
<template>
  <div v-if="count > 0" class="notification-badge" :class="{ 'notification-badge--pulse': count > 0 }">
    <span class="notification-count">{{ count > 99 ? '99+' : count }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  count: number
}

defineProps<Props>()
</script>

<style scoped>
.notification-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--color-error);
  color: var(--color-text-inverse);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  box-shadow: var(--shadow-sm);
}

.notification-badge--pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.notification-count {
  line-height: 1;
}
</style>



