<!--
  ActorManagementPanel - Container Component
  Manages users (create, edit, delete) - Table View
-->
<template>
  <div class="actor-management-panel">
    <!-- Header Section -->
    <div class="panel-header">
      <div class="header-content">
        <div class="header-title">
          <h1>User Management</h1>
          <p class="header-subtitle">Manage users and their roles</p>
        </div>
        <div class="header-stats" v-if="!loading && !error">
          <div class="stat-badge">
            <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <span class="stat-value">{{ actors.length }}</span>
            <span class="stat-label">Total Users</span>
          </div>
        </div>
      </div>
      <div class="header-border"></div>
    </div>

    <!-- Create User Form -->
    <div v-if="showCreateForm" class="create-form-container">
      <CreateActorForm
        @created="handleActorCreated"
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
        <p>Loading users...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="error-text">
          <h3>Error Loading Users</h3>
          <p>{{ error.message || 'An error occurred' }}</p>
        </div>
        <button @click="loadActors" class="btn btn--primary">
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
          <h2>All Users</h2>
          <p class="section-subtitle">View and manage all system users</p>
        </div>
        <button @click="showCreateForm = !showCreateForm" class="btn btn--primary">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>{{ showCreateForm ? 'Cancel' : 'Create New User' }}</span>
        </button>
      </div>

      <!-- Search Field and Users Table -->
      <template v-if="actors.length > 0">
        <!-- Search Field -->
        <div class="search-container">
          <div class="search-wrapper">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users by name or role..."
              class="search-input"
            />
          </div>
        </div>

        <!-- Users Table -->
        <div class="users-table-container">
          <table class="users-table" v-if="filteredActors.length > 0">
            <thead>
              <tr>
                <th class="col-name">Name</th>
                <th class="col-role">Role</th>
                <th class="col-tasks">Total Tasks</th>
                <th class="col-pending">Pending</th>
                <th class="col-in-progress">In Progress</th>
                <th class="col-completed">Completed</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="actor in filteredActors"
                :key="actor.guid"
                class="user-row"
                @click="handleActorClick(actor.guid)"
              >
                <td class="col-name">
                  <div class="user-name-cell">
                    <svg class="user-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <div class="user-name">{{ actor.displayName }}</div>
                  </div>
                </td>
                <td class="col-role">
                  <span v-if="actor.role" class="badge">
                    {{ actor.role.displayName }}
                  </span>
                  <span v-else class="badge badge--no-role">No role</span>
                </td>
                <td class="col-tasks">
                  <span class="task-count">{{ getUserTaskCount(actor.guid) }}</span>
                </td>
                <td class="col-pending">
                  <span class="task-count task-count--pending">{{ getUserPendingCount(actor.guid) }}</span>
                </td>
                <td class="col-in-progress">
                  <span class="task-count task-count--in-progress">{{ getUserInProgressCount(actor.guid) }}</span>
                </td>
                <td class="col-completed">
                  <span class="task-count task-count--completed">{{ getUserCompletedCount(actor.guid) }}</span>
                </td>
                <td class="col-actions" @click.stop>
                  <div class="action-buttons">
                    <button
                      @click.stop="handleEdit(actor)"
                      class="btn btn--secondary btn--small"
                      title="Edit User"
                    >
                      <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      @click.stop="handleDelete(actor.guid)"
                      class="btn btn--secondary btn--small btn--delete"
                      title="Delete User"
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
          
          <!-- No Search Results -->
          <div v-if="searchQuery && filteredActors.length === 0" class="empty-state">
            <div class="empty-content">
              <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <h3>No Results Found</h3>
              <p>No users found matching "{{ searchQuery }}".</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <h3>No Users Found</h3>
          <p>Create your first user to get started with user management.</p>
          <button @click="showCreateForm = true" class="btn btn--primary">
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Create First User</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Actor Modal -->
    <div v-if="showEditForm && editingActor" class="modal-overlay" @click="showEditForm = false">
      <div class="modal-content" @click.stop>
        <EditActorForm
          :actor="editingActor"
          @updated="handleActorUpdated"
          @cancel="showEditForm = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActor } from '@/composables/useActor'
import { useRole } from '@/composables/useRole'
import { useWorkStep } from '@/composables/useWorkStep'
import { useUserStore } from '@/stores/user'
import CreateActorForm from './CreateActorForm.vue'
import EditActorForm from './EditActorForm.vue'
import type { ActorDto, RoleDto } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()
const { actors, loading, error, loadActors, deleteActor } = useActor()
const { roles, loadRoles } = useRole()
const { workSteps, loadWorkSteps } = useWorkStep()
const isAdmin = computed(() => userStore.isAdmin)
const showCreateForm = ref(false)
const showEditForm = ref(false)
const editingActor = ref<ActorDto | null>(null)
const searchQuery = ref('')

// Filter actors based on search query
const filteredActors = computed(() => {
  if (!searchQuery.value.trim()) {
    return actors.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return actors.value.filter((actor) => {
    const nameMatch = actor.displayName.toLowerCase().includes(query)
    const roleMatch = actor.role?.displayName.toLowerCase().includes(query) || false
    return nameMatch || roleMatch
  })
})

onMounted(async () => {
  await Promise.all([loadActors(), loadRoles(), loadWorkSteps()])
})

async function handleActorCreated() {
  showCreateForm.value = false
  await Promise.all([loadActors(), loadWorkSteps()])
}

function handleActorClick(actorGuid: string) {
  router.push(`/users/${actorGuid}`)
}

function handleEdit(actor: ActorDto) {
  editingActor.value = actor
  showEditForm.value = true
}

async function handleActorUpdated() {
  showEditForm.value = false
  editingActor.value = null
  await Promise.all([loadActors(), loadWorkSteps()])
}


function getUserTaskCount(userId: string): number {
  return workSteps.value.filter((ws) => {
    if (!ws.assignedTo) return false
    if (Array.isArray(ws.assignedTo)) {
      return ws.assignedTo.includes(userId)
    }
    return ws.assignedTo === userId
  }).length
}

function getUserPendingCount(userId: string): number {
  return workSteps.value.filter((ws) => {
    if (ws.status !== 'PENDING') return false
    if (!ws.assignedTo) return false
    if (Array.isArray(ws.assignedTo)) {
      return ws.assignedTo.includes(userId)
    }
    return ws.assignedTo === userId
  }).length
}

function getUserInProgressCount(userId: string): number {
  return workSteps.value.filter((ws) => {
    if (ws.status !== 'IN_PROGRESS') return false
    if (!ws.assignedTo) return false
    if (Array.isArray(ws.assignedTo)) {
      return ws.assignedTo.includes(userId)
    }
    return ws.assignedTo === userId
  }).length
}

function getUserCompletedCount(userId: string): number {
  return workSteps.value.filter((ws) => {
    if (ws.status !== 'COMPLETED') return false
    if (!ws.assignedTo) return false
    if (Array.isArray(ws.assignedTo)) {
      return ws.assignedTo.includes(userId)
    }
    return ws.assignedTo === userId
  }).length
}

async function handleDelete(guid: string) {
  if (!isAdmin.value) {
    alert('Only administrators can delete users.')
    return
  }

  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return
  }

  try {
    await deleteActor(guid)
  } catch (err) {
    console.error('Failed to delete actor:', err)
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete user. Please try again.'
    alert(errorMessage)
  }
}
</script>

<style scoped>
.actor-management-panel {
  min-height: 100vh;
  background: var(--color-background);
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

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

/* Search Container */
.search-container {
  margin-bottom: var(--spacing-lg);
}

.search-wrapper {
  position: relative;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) calc(var(--spacing-md) * 2 + 20px);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

/* Users Table Container */
.users-table-container {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-surface);
}

.users-table thead {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  position: sticky;
  top: 0;
  z-index: 10;
}

.users-table th {
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  color: var(--color-text-inverse);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  vertical-align: middle;
}

.user-row {
  cursor: pointer;
  transition: all var(--transition-base);
}

.user-row:hover {
  background: var(--color-surface-hover);
  transform: translateX(2px);
}

.user-row:last-child td {
  border-bottom: none;
}

.user-name-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.user-name {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  font-size: var(--text-base);
}

.badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  color: var(--color-primary-dark);
  display: inline-block;
}

.badge--no-role {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.task-count {
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
  color: var(--color-text-primary);
}

.task-count--pending {
  color: #d97706;
}

.task-count--in-progress {
  color: #2563eb;
}

.task-count--completed {
  color: #16a34a;
}

.col-name {
  min-width: 200px;
}

.col-role {
  min-width: 120px;
}

.col-tasks,
.col-pending,
.col-in-progress,
.col-completed {
  min-width: 100px;
  text-align: center;
}

.col-actions {
  min-width: 220px;
  text-align: right;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: flex-end;
  flex-wrap: nowrap;
}

.action-buttons .btn {
  display: inline-flex;
  opacity: 1;
  visibility: visible;
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

.btn--delete {
  color: #dc2626;
  border-color: #dc2626;
}

.btn--delete:hover {
  background: #fee2e2;
  border-color: #dc2626;
}

.btn--delete .btn-icon {
  color: #dc2626;
}

.btn--delete span {
  color: #dc2626;
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

.btn--disabled,
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

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

@media (max-width: 768px) {
  .actor-management-panel {
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

  .users-table-container {
    overflow-x: auto;
  }

  .users-table {
    font-size: var(--text-sm);
  }

  .users-table th,
  .users-table td {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .col-pending,
  .col-in-progress,
  .col-completed {
    display: none;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>






