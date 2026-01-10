<!--
  RoleManagementView - View for managing roles
-->
<template>
  <div class="role-management-view">
    <RoleManagementPanel />
  </div>
</template>

<script setup lang="ts">
import RoleManagementPanel from '@/components/containers/RoleManagementPanel.vue'
</script>

<style scoped>
.role-management-view {
  min-height: 100vh;
  background: var(--color-background);
}
</style>








