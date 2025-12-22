<!--
  WorkflowManager Dashboard View
  Shows deadline tracking and workflow progress
  Demonstrates Usability III: Real-time updates for workflow manager
-->
<template>
  <div class="workflow-manager-dashboard">
    <div class="dashboard__header">
      <h1>Workflow Manager Dashboard</h1>
      <div class="dashboard__user-info">
        <span v-if="currentUser">Logged in as: {{ currentUser.username }}</span>
      </div>
    </div>

    <div v-if="loading" class="dashboard__loading">
      Loading workflows...
    </div>

    <div v-else-if="error" class="dashboard__error">
      Error: {{ error.message }}
    </div>

    <div v-else class="dashboard__content">
      <!-- Navigation Links -->
      <div class="dashboard__navigation">
        <router-link to="/roles" class="nav-link">
          👥 Manage Roles
        </router-link>
        <router-link to="/actors" class="nav-link">
          👤 Manage Actors
        </router-link>
      </div>

      <!-- Create Workflow Button -->
      <div class="workflows-section">
        <div class="section-header">
          <h2>Workflows</h2>
          <button
            @click="showCreateForm = !showCreateForm"
            class="btn btn--primary"
          >
            + Create New Workflow
          </button>
        </div>

        <!-- Create Workflow Form -->
        <CreateWorkflowForm
          v-if="showCreateForm"
          :show-form="showCreateForm"
          @close="showCreateForm = false"
          @created="handleWorkflowCreated"
        />

        <div v-if="workflows.length === 0 && !showCreateForm" class="empty-state">
          <p>No workflows found. Create your first workflow to get started.</p>
        </div>

        <div v-else-if="workflows.length > 0" class="workflows-grid">
          <div
            v-for="workflow in workflows"
            :key="workflow.id"
            class="workflow-card"
            @click="selectedWorkflowId = workflow.id"
            :class="{ 'workflow-card--selected': selectedWorkflowId === workflow.id }"
          >
            <h3>{{ workflow.name }}</h3>
            <p v-if="workflow.description" class="workflow-description">
              {{ workflow.description }}
            </p>
            <div class="workflow-progress">
              <WorkflowProgressCard :workflow-id="workflow.id" />
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
import { useUserStore } from '@/stores/user'
import WorkflowProgressCard from '@/components/containers/WorkflowProgressCard.vue'
import WorkflowDetailsPanel from '@/components/containers/WorkflowDetailsPanel.vue'
import CreateWorkflowForm from '@/components/containers/CreateWorkflowForm.vue'

const selectedWorkflowId = ref<string | null>(null)
const showCreateForm = ref(false)
const { workflows, loading, error, loadWorkflows } = useWorkflow()
const { loadWorkSteps } = useWorkStep()
const userStore = useUserStore()

const currentUser = computed(() => userStore.currentUser)

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

// Set mock user for prototype (workflow manager)
onMounted(async () => {
  if (!currentUser.value) {
    userStore.setCurrentUser({
      id: 'user-1',
      username: 'alice',
      email: 'alice@example.com',
      role: 'WORKFLOW_MANAGER' as any,
      tenantId: 'tenant-1',
    })
  }
  
  await loadWorkflows()
})
</script>

<style scoped>
.workflow-manager-dashboard {
  padding: 1rem;
  width: 100%;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .workflow-manager-dashboard {
    padding: 2rem 3rem;
  }
}

@media (min-width: 1440px) {
  .workflow-manager-dashboard {
    padding: 3rem 4rem;
    max-width: 1800px;
  }
}

.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard__navigation {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.nav-link {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  transition: all var(--transition-base);
}

.nav-link:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.dashboard__header h1 {
  margin: 0;
  font-size: 2rem;
}

.dashboard__user-info {
  color: #666;
}

.dashboard__loading,
.dashboard__error {
  padding: 2rem;
  text-align: center;
}

.dashboard__error {
  color: #f44336;
}

.workflows-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.workflows-section h2 {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #888;
}

.workflows-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .workflows-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
}

.workflow-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.workflow-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #2196f3;
}

.workflow-card--selected {
  border-color: #2196f3;
  background: #e3f2fd;
}

.workflow-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.workflow-description {
  color: #666;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.workflow-progress {
  margin-top: 1rem;
}

.workflow-details {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e0e0e0;
}
</style>

