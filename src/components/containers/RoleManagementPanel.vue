<!--
  RoleManagementPanel - Container Component
  Manages roles (create, edit, delete)
-->
<template>
  <div class="role-management-panel">
    <div class="panel-header">
      <h2>Role Management</h2>
      <button @click="showCreateForm = !showCreateForm" class="btn btn--primary">
        + Create New Role
      </button>
    </div>

    <!-- Create Role Form -->
    <div v-if="showCreateForm" class="create-form-container">
      <CreateRoleForm
        @created="handleRoleCreated"
        @cancel="showCreateForm = false"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      Loading roles...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      Error: {{ error.message }}
    </div>

    <!-- Roles List -->
    <div v-else-if="roles.length > 0" class="roles-list">
      <div
        v-for="role in roles"
        :key="role.guid"
        class="role-card"
        :class="{ 'role-card--admin': role.isAdmin }"
      >
        <div class="role-card__header">
          <h3>{{ role.displayName }}</h3>
          <span v-if="role.isAdmin" class="badge badge--admin">Admin</span>
        </div>
        <p v-if="role.description" class="role-card__description">
          {{ role.description }}
        </p>
        <div class="role-card__actions">
          <button
            @click="handleEdit(role)"
            class="btn btn--secondary btn--small"
          >
            Edit
          </button>
          <button
            @click="handleDelete(role.guid)"
            class="btn btn--danger btn--small"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>No roles found. Create your first role to get started.</p>
    </div>

    <!-- Edit Role Modal -->
    <div v-if="showEditForm && editingRole" class="modal-overlay" @click="showEditForm = false">
      <div class="modal-content" @click.stop>
        <EditRoleForm
          :role="editingRole"
          @updated="handleRoleUpdated"
          @cancel="showEditForm = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRole } from '@/composables/useRole'
import CreateRoleForm from './CreateRoleForm.vue'
import EditRoleForm from './EditRoleForm.vue'
import type { RoleDto } from '@/types/api'

const { roles, loading, error, loadRoles, deleteRole } = useRole()
const showCreateForm = ref(false)
const showEditForm = ref(false)
const editingRole = ref<RoleDto | null>(null)

onMounted(async () => {
  await loadRoles()
})

async function handleRoleCreated() {
  showCreateForm.value = false
  await loadRoles()
}

function handleEdit(role: RoleDto) {
  editingRole.value = role
  showEditForm.value = true
}

async function handleRoleUpdated() {
  showEditForm.value = false
  editingRole.value = null
  await loadRoles()
}

async function handleDelete(guid: string) {
  if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
    return
  }

  try {
    await deleteRole(guid)
    await loadRoles()
  } catch (err) {
    console.error('Failed to delete role:', err)
    alert('Failed to delete role. Please try again.')
  }
}
</script>

<style scoped>
.role-management-panel {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.panel-header h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.create-form-container {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.loading-state,
.error-state {
  padding: var(--spacing-xl);
  text-align: center;
}

.error-state {
  color: var(--color-danger);
}

.roles-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.role-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.role-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.role-card--admin {
  border-left: 4px solid var(--color-primary);
}

.role-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.role-card__header h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.badge--admin {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.role-card__description {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-md);
}

.role-card__actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.empty-state {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-text-tertiary);
}

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
}

.modal-content {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}
</style>




