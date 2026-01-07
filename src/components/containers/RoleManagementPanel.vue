<!--
  RoleManagementPanel - Container Component
  Manages roles (create, edit, delete)
-->
<template>
  <div class="role-management-panel">
    <!-- Header Section -->
    <div class="panel-header">
      <div class="header-content">
        <div class="header-title">
          <h1>Role Management</h1>
          <p class="header-subtitle">Manage user roles and permissions</p>
        </div>
        <div class="header-stats" v-if="!loading && !error">
          <div class="stat-badge">
            <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span class="stat-value">{{ roles.length }}</span>
            <span class="stat-label">Total Roles</span>
          </div>
        </div>
      </div>
      <div class="header-border"></div>
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
      <div class="loading-content">
        <svg class="loading-spinner" fill="none" viewBox="0 0 24 24">
          <circle class="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
          <path class="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Loading roles...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="error-text">
          <h3>Error Loading Roles</h3>
          <p>{{ error.message }}</p>
        </div>
        <button @click="loadRoles" class="btn btn--primary">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Retry</span>
        </button>
      </div>
    </div>

    <!-- Content Section -->
    <div v-else class="content-section">
      <!-- Section Header -->
      <div class="section-header">
        <div class="section-title">
          <h2>All Roles</h2>
          <p class="section-subtitle">View and manage all system roles</p>
        </div>
        <button @click="showCreateForm = !showCreateForm" class="btn btn--primary">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>{{ showCreateForm ? 'Cancel' : 'Create New Role' }}</span>
        </button>
      </div>

      <!-- Roles List -->
      <div v-if="roles.length > 0" class="roles-list-container">
        <table class="roles-table">
          <thead>
            <tr>
              <th class="col-name">Role Name</th>
              <th class="col-description">Description</th>
              <th class="col-admin">Admin</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="role in roles"
              :key="role.guid"
              class="role-row"
              :class="{ 'role-row--admin': role.isAdmin }"
            >
              <td class="col-name">
                <div class="role-name-cell">
                  <svg class="role-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <div class="role-name">{{ role.displayName }}</div>
                </div>
              </td>
              <td class="col-description">
                <span v-if="role.description" class="role-description">{{ role.description }}</span>
                <span v-else class="role-description-empty">No description</span>
              </td>
              <td class="col-admin">
                <span v-if="role.isAdmin" class="badge badge--admin">
                  <svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  <span>Yes</span>
                </span>
                <span v-else class="badge badge--no-admin">
                  <svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>No</span>
                </span>
              </td>
              <td class="col-actions" @click.stop>
                <div class="action-buttons">
                  <button
                    @click.stop="handleEdit(role)"
                    class="btn btn--secondary btn--small"
                    title="Edit Role"
                  >
                    <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    @click.stop="handleDelete(role.guid)"
                    class="btn btn--danger btn--small"
                    title="Delete Role"
                  >
                    <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h3>No Roles Found</h3>
          <p>Create your first role to get started with role management.</p>
          <button @click="showCreateForm = true" class="btn btn--primary">
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Create First Role</span>
          </button>
        </div>
      </div>
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
  min-height: 100vh;
  background: var(--color-background);
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Section */
.panel-header {
  margin-bottom: var(--spacing-2xl);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.header-title h1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.header-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  min-width: 100px;
}

.stat-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: var(--text-xs);
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.header-border {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-border), transparent);
}

/* Create Form Container */
.create-form-container {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-light);
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-2xl);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

.spinner-circle {
  opacity: 0.25;
}

.spinner-path {
  opacity: 0.75;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Error State */
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-2xl);
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  text-align: center;
  max-width: 500px;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: var(--color-danger);
}

.error-text h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.error-text p {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Content Section */
.content-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
}

.section-title h2 {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.section-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Roles List Container */
.roles-list-container {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
}

.roles-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-surface);
}

.roles-table thead {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  position: sticky;
  top: 0;
  z-index: 10;
}

.roles-table th {
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  color: var(--color-text-inverse);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.roles-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  vertical-align: middle;
}

.role-row {
  cursor: pointer;
  transition: all var(--transition-base);
}

.role-row:hover {
  background: var(--color-surface-hover);
  transform: translateX(2px);
}

.role-row--admin {
  border-left: 4px solid var(--color-primary);
}

.role-row:last-child td {
  border-bottom: none;
}

.role-name-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.role-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.role-name {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  font-size: var(--text-base);
}

.role-description {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.role-description-empty {
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  font-style: italic;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.badge-icon {
  width: 14px;
  height: 14px;
}

.badge--admin {
  background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
  color: #1e40af;
}

.badge--no-admin {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.col-name {
  min-width: 200px;
}

.col-description {
  min-width: 300px;
}

.col-admin {
  min-width: 120px;
}

.col-actions {
  min-width: 180px;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.btn--primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn--secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn--secondary:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}

.btn--danger {
  background: var(--color-danger);
  color: white;
}

.btn--danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn--small {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-xs);
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-2xl);
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  text-align: center;
  max-width: 500px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: var(--color-text-tertiary);
  opacity: 0.5;
}

.empty-content h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.empty-content p {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Modal */
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
  backdrop-filter: blur(4px);
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
  border: 1px solid var(--color-border-light);
}

/* Responsive Design */
@media (max-width: 768px) {
  .role-management-panel {
    padding: var(--spacing-md);
  }

  .header-content {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .section-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .roles-list-container {
    overflow-x: auto;
  }

  .roles-table {
    font-size: var(--text-sm);
  }

  .roles-table th,
  .roles-table td {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .col-description {
    display: none;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>






