<!--
  WorkflowManager Dashboard View
  Shows deadline tracking and workflow progress
  Demonstrates Usability III: Real-time updates for workflow manager
-->
<template>
  <div class="workflow-manager-dashboard">
    <!-- Header Section -->
    <div class="dashboard__header">
      <div class="header-content">
        <div class="header-title-section">
          <h1 class="page-title">Workflow Manager Dashboard</h1>
          <p class="page-subtitle">Oversee and manage all workflows and their progress</p>
        </div>
        <div v-if="!loading && !error && workflows.length > 0" class="header-stats">
          <div class="stat-badge">
            <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span class="stat-value">{{ workflows.length }}</span>
            <span class="stat-label">Workflows</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="dashboard__loading">
      <div class="loading-content">
        <svg class="loading-spinner" fill="none" viewBox="0 0 24 24">
          <circle class="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
          <path class="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Loading workflows...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="dashboard__error">
      <div class="error-content">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="error-text">
          <h3>Error Loading Workflows</h3>
          <p>{{ error.message }}</p>
        </div>
        <button @click="loadWorkflows" class="btn btn--primary">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Retry</span>
        </button>
      </div>
    </div>

    <div v-else class="dashboard__content">
      <!-- Quick Actions Navigation -->
      <div class="dashboard__navigation">
        <router-link to="/roles" class="nav-link">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <span>Manage Roles</span>
        </router-link>
        <router-link to="/users" class="nav-link">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <span>Manage Users</span>
        </router-link>
      </div>

      <!-- Workflows Section -->
      <div class="workflows-section">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">Workflows</h2>
            <p class="section-subtitle">Create and manage your workflow processes</p>
          </div>
          <button
            @click="showCreateForm = !showCreateForm"
            class="btn btn--primary"
          >
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Create New Workflow</span>
          </button>
        </div>

        <!-- Create Workflow Form -->
        <CreateWorkflowForm
          v-if="showCreateForm"
          :show-form="showCreateForm"
          @close="showCreateForm = false"
          @created="handleWorkflowCreated"
        />

        <!-- Empty State -->
        <div v-if="workflows.length === 0 && !showCreateForm" class="empty-state">
          <div class="empty-content">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <h3 class="empty-title">No Workflows Found</h3>
            <p class="empty-message">Create your first workflow to get started with task management</p>
            <button @click="showCreateForm = true" class="btn btn--primary">
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span>Create Your First Workflow</span>
            </button>
          </div>
        </div>

        <!-- Workflows Grid -->
        <div v-else-if="workflows.length > 0" class="workflows-grid">
          <div
            v-for="workflow in workflows"
            :key="workflow.id"
            class="workflow-card"
            @click="selectedWorkflowId = workflow.id"
            :class="{ 'workflow-card--selected': selectedWorkflowId === workflow.id }"
          >
            <div class="workflow-card-header">
              <div class="workflow-icon-wrapper">
                <svg class="workflow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="workflow-card-title-section">
                <h3 class="workflow-card-title">{{ workflow.name }}</h3>
                <p v-if="workflow.description" class="workflow-description">
                  {{ workflow.description }}
                </p>
              </div>
            </div>
            <div class="workflow-progress">
              <WorkflowProgressCard :workflow-id="workflow.id" />
            </div>
            <div class="workflow-card-footer">
              <svg class="workflow-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Workflow Details -->
      <div v-if="selectedWorkflowId" class="workflow-details">
        <WorkflowDetailsPanel
          :workflow-id="selectedWorkflowId"
          @close="selectedWorkflowId = null"
          @deleted="handleWorkflowDeleted"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorkflow } from '@/composables/useWorkflow'
import { useWorkStep } from '@/composables/useWorkStep'
import { useUser } from '@/composables/useUser'
import { useActor } from '@/composables/useActor'
import WorkflowProgressCard from '@/components/containers/WorkflowProgressCard.vue'
import WorkflowDetailsPanel from '@/components/containers/WorkflowDetailsPanel.vue'
import CreateWorkflowForm from '@/components/containers/CreateWorkflowForm.vue'

const selectedWorkflowId = ref<string | null>(null)
const showCreateForm = ref(false)
const { workflows, loading, error, loadWorkflows } = useWorkflow()
const { loadWorkSteps } = useWorkStep()
const { currentUser, setCurrentUser } = useUser()
const { actors, loadActors } = useActor()

async function handleWorkflowCreated(workflowId: string) {
  showCreateForm.value = false
  await loadWorkflows()
  await loadWorkSteps()
  selectedWorkflowId.value = workflowId // Select the newly created workflow
}

function handleWorkflowDeleted(workflowId: string) {
  selectedWorkflowId.value = null
  // Workflows list will be reloaded by WorkflowDetailsPanel
}

// Load actors and set current user
onMounted(async () => {
  await loadActors()
  
  // Set current user if not set (use first admin actor or first actor as default)
  if (!currentUser.value && actors.value.length > 0) {
    const adminActor = actors.value.find(a => a.role?.isAdmin)
    const firstActor = adminActor || actors.value[0]
    if (firstActor) {
      setCurrentUser({
        id: firstActor.guid,
        username: firstActor.displayName,
        email: `${firstActor.displayName}@example.com`,
        role: (firstActor.role?.isAdmin ? 'ADMIN' : 'WORKFLOW_MANAGER') as any,
        tenantId: undefined,
      })
    }
  }
  
  await loadWorkflows()
})
</script>

<style scoped>
.workflow-manager-dashboard {
  padding: var(--spacing-xl);
  width: 100%;
  margin: 0 auto;
  background: var(--color-background);
  min-height: calc(100vh - 80px);
}

@media (min-width: 768px) {
  .workflow-manager-dashboard {
    padding: var(--spacing-2xl) var(--spacing-3xl);
  }
}

@media (min-width: 1440px) {
  .workflow-manager-dashboard {
    padding: var(--spacing-3xl) var(--spacing-3xl);
    max-width: 1800px;
  }
}

/* Header Section */
.dashboard__header {
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-xl);
  flex-wrap: wrap;
}

.header-title-section {
  flex: 1;
  min-width: 0;
}

.page-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  line-height: var(--leading-tight);
}

.page-subtitle {
  margin: 0;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  font-weight: var(--font-normal);
}

@media (min-width: 768px) {
  .page-title {
    font-size: var(--text-4xl);
  }
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
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  border-radius: var(--radius-lg);
  color: white;
  min-width: 100px;
}

.stat-icon {
  width: 24px;
  height: 24px;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Loading State */
.dashboard__loading {
  padding: var(--spacing-3xl);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
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
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite;
}

.spinner-path {
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}

.loading-content p {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
}

/* Error State */
.dashboard__error {
  padding: var(--spacing-3xl);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  text-align: center;
  max-width: 500px;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: var(--color-error);
}

.error-text h3 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.error-text p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--text-base);
}

/* Navigation Links */
.dashboard__navigation {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.nav-icon {
  width: 20px;
  height: 20px;
}

.nav-link:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* Workflows Section */
.workflows-section {
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.section-title-wrapper {
  flex: 1;
  min-width: 0;
}

.section-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.section-subtitle {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.btn--primary {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

.btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  padding: var(--spacing-3xl);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  text-align: center;
  max-width: 500px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: var(--color-text-tertiary);
  opacity: 0.5;
}

.empty-title {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.empty-message {
  margin: 0;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

/* Workflows Grid */
.workflows-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

@media (min-width: 768px) {
  .workflows-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: var(--spacing-xl);
  }
}

@media (min-width: 1440px) {
  .workflows-grid {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
}

.workflow-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  position: relative;
  overflow: hidden;
}

.workflow-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-base);
}

.workflow-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-primary);
}

.workflow-card:hover::before {
  transform: scaleX(1);
}

.workflow-card--selected {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, var(--color-surface) 100%);
  box-shadow: var(--shadow-lg);
}

.workflow-card--selected::before {
  transform: scaleX(1);
}

.workflow-card-header {
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;
}

.workflow-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.workflow-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.workflow-card-title-section {
  flex: 1;
  min-width: 0;
}

.workflow-card-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.workflow-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.workflow-progress {
  margin-top: var(--spacing-sm);
}

.workflow-card-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
}

.workflow-arrow {
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
  transition: transform var(--transition-base);
}

.workflow-card:hover .workflow-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

.workflow-details {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-2xl);
  border-top: 2px solid var(--color-border);
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .workflow-card {
    padding: var(--spacing-lg);
  }
}
</style>

