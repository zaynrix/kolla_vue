<!--
  ActorManagementPanel - Container Component
  Manages actors (create, edit, delete)
-->
<template>
  <div class="actor-management-panel">
    <div class="panel-header">
      <h2>Actor Management</h2>
      <button @click="showCreateForm = !showCreateForm" class="btn btn--primary">
        + Create New Actor
      </button>
    </div>

    <!-- Create Actor Form -->
    <div v-if="showCreateForm" class="create-form-container">
      <CreateActorForm
        @created="handleActorCreated"
        @cancel="showCreateForm = false"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      Loading actors...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      Error: {{ error.message }}
    </div>

    <!-- Actors List -->
    <div v-else-if="actors.length > 0" class="actors-list">
      <div
        v-for="actor in actors"
        :key="actor.guid"
        class="actor-card"
      >
        <div class="actor-card__header">
          <h3>{{ actor.nickname }}</h3>
          <span v-if="actorRoleMap.get(actor.guid)" class="badge">
            {{ actorRoleMap.get(actor.guid) }}
          </span>
        </div>
        <div class="actor-card__info">
          <p v-if="actor.roleGuid" class="actor-card__role">
            Role: {{ getRoleName(actor.roleGuid) }}
          </p>
          <p v-else class="actor-card__role">No role assigned</p>
        </div>
        <div class="actor-card__actions">
          <button
            @click="handleEdit(actor)"
            class="btn btn--secondary btn--small"
          >
            Edit
          </button>
          <button
            @click="handleDelete(actor.guid)"
            class="btn btn--danger btn--small"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>No actors found. Create your first actor to get started.</p>
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
import { useActor } from '@/composables/useActor'
import { useRole } from '@/composables/useRole'
import CreateActorForm from './CreateActorForm.vue'
import EditActorForm from './EditActorForm.vue'
import type { ActorDto, RoleDto } from '@/types/api'

const { actors, loading, error, loadActors, deleteActor } = useActor()
const { roles, loadRoles } = useRole()
const showCreateForm = ref(false)
const showEditForm = ref(false)
const editingActor = ref<ActorDto | null>(null)

// Map actor GUIDs to role names
const actorRoleMap = computed(() => {
  const map = new Map<string, string>()
  actors.value.forEach((actor) => {
    if (actor.roleGuid) {
      const role = roles.value.find((r) => r.guid === actor.roleGuid)
      if (role) {
        map.set(actor.guid, role.displayName)
      }
    }
  })
  return map
})

onMounted(async () => {
  await Promise.all([loadActors(), loadRoles()])
})

function getRoleName(roleGuid: string): string {
  const role = roles.value.find((r) => r.guid === roleGuid)
  return role?.displayName || 'Unknown'
}

async function handleActorCreated() {
  showCreateForm.value = false
  await loadActors()
}

function handleEdit(actor: ActorDto) {
  editingActor.value = actor
  showEditForm.value = true
}

async function handleActorUpdated() {
  showEditForm.value = false
  editingActor.value = null
  await loadActors()
}

async function handleDelete(guid: string) {
  if (!confirm('Are you sure you want to delete this actor? This action cannot be undone.')) {
    return
  }

  try {
    await deleteActor(guid)
    await loadActors()
  } catch (err) {
    console.error('Failed to delete actor:', err)
    alert('Failed to delete actor. Please try again.')
  }
}
</script>

<style scoped>
.actor-management-panel {
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

.actors-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.actor-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.actor-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.actor-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.actor-card__header h3 {
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
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.actor-card__info {
  margin-bottom: var(--spacing-md);
}

.actor-card__role {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin: 0;
}

.actor-card__actions {
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




