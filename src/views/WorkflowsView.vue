<!--
  Example View demonstrating MVVM architecture usage
  Shows how Container components handle state and delegate to Presenters
-->
<template>
  <div class="workflows-view">
    <h1>Workflows</h1>

    <div class="workflows-view__search">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search workflows..."
        class="workflows-view__search-input"
      />
    </div>

    <WorkflowListContainer
      :search-term="searchTerm"
      @view="handleViewWorkflow"
      @edit="handleEditWorkflow"
      @delete="handleDeleteWorkflow"
    />

    <div v-if="selectedWorkflowId" class="workflows-view__objectives">
      <h2>Objectives for Selected Workflow</h2>
      <ObjectiveListContainer
        :workflow-id="selectedWorkflowId"
        :show-prioritized="true"
        @edit="handleEditObjective"
        @delete="handleDeleteObjective"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WorkflowListContainer from '@/components/containers/WorkflowListContainer.vue'
import ObjectiveListContainer from '@/components/containers/ObjectiveListContainer.vue'

const searchTerm = ref('')
const selectedWorkflowId = ref<string | null>(null)

function handleViewWorkflow(id: string) {
  selectedWorkflowId.value = id
  console.log('View workflow:', id)
}

function handleEditWorkflow(id: string) {
  console.log('Edit workflow:', id)
  // Navigate to edit page or open modal
}

function handleDeleteWorkflow(id: string) {
  if (confirm('Are you sure you want to delete this workflow?')) {
    console.log('Delete workflow:', id)
    if (selectedWorkflowId.value === id) {
      selectedWorkflowId.value = null
    }
  }
}

function handleEditObjective(id: string) {
  console.log('Edit objective:', id)
}

function handleDeleteObjective(id: string) {
  console.log('Delete objective:', id)
}
</script>

<style scoped>
.workflows-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.workflows-view__search {
  margin: 1.5rem 0;
}

.workflows-view__search-input {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.workflows-view__objectives {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #e0e0e0;
}
</style>



