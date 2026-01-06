<!--
  ActorManagementView - View for managing actors
-->
<template>
  <div class="actor-management-view">
    <ActorManagementPanel />
  </div>
</template>

<script setup lang="ts">
import ActorManagementPanel from '@/components/containers/ActorManagementPanel.vue'
</script>

<style scoped>
.actor-management-view {
  min-height: 100vh;
  background: var(--color-background);
}
</style>






