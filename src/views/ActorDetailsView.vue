<!--
  ActorDetailsView - View for displaying actor details and assignments
-->
<template>
  <div class="actor-details-view">
    <div class="view-container">
      <!-- Back Button -->
      <button @click="goBack" class="btn btn--secondary btn--back">
        ← Back to Users
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        Loading actor details...
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>Error: {{ error.message || 'An error occurred' }}</p>
        <button @click="loadActorDetails" class="btn btn--secondary btn--small" style="margin-top: var(--spacing-md);">
          Retry
        </button>
      </div>

      <!-- Actor Details -->
      <div v-else-if="actor" class="actor-details">
        <!-- Actor Header -->
        <div class="actor-header">
          <div class="actor-header__info">
            <h1>{{ actor.displayName }}</h1>
            <span v-if="actor.role" class="badge badge--role">
              {{ actor.role.displayName }}
            </span>
            <span v-else class="badge badge--no-role">
              No role assigned
            </span>
          </div>
        </div>

        <!-- Assignments Section -->
        <div class="assignments-section">
          <div class="section-header">
            <h2>Assignments</h2>
            <span class="badge badge--count">{{ assignments.length }} assignment(s)</span>
          </div>

          <!-- Loading Assignments -->
          <div v-if="loadingAssignments" class="loading-state">
            Loading assignments...
          </div>

          <!-- Empty State -->
          <div v-else-if="assignments.length === 0" class="empty-state">
            <p>No assignments found for this actor.</p>
          </div>

          <!-- Assignments List -->
          <div v-else class="assignments-list">
            <AssignmentCard
              v-for="assignment in assignments"
              :key="assignment.guid"
              :assignment="assignment"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useActor } from '@/composables/useActor'
import { useApi } from '@/composables/useApi'
import { useUserStore } from '@/stores/user'
import AssignmentCard from '@/components/presenters/AssignmentCard.vue'
import type { ActorDto, AssignmentDto } from '@/types/api'

const route = useRoute()
const router = useRouter()
const { getActor } = useActor()
const api = useApi()
const userStore = useUserStore()

const actor = ref<ActorDto | null>(null)
const assignments = ref<AssignmentDto[]>([])
const loading = ref(false)
const loadingAssignments = ref(false)
const error = ref<Error | null>(null)

const actorGuid = route.params.id as string

// Check if current user is admin (has role with isAdmin flag)
const isAdmin = computed(() => userStore.isAdmin)
const currentUserGuid = computed(() => userStore.currentUser?.id)

// Check if user can view this actor's details
const canViewActor = computed(() => {
  // Admin can view any actor
  if (isAdmin.value) return true
  // Non-admin can only view their own details
  return currentUserGuid.value === actorGuid
})

async function loadActorDetails() {
  if (!actorGuid) {
    error.value = new Error('Actor ID is required')
    return
  }

  loading.value = true
  error.value = null
  try {
    actor.value = await getActor(actorGuid)
    
    // Check permissions: non-admin users can only view their own details
    if (!canViewActor.value) {
      error.value = new Error('You do not have permission to view this actor\'s details. You can only view your own assignments.')
      loading.value = false
      return
    }
    
    await loadAssignments()
  } catch (err) {
    error.value = err instanceof Error ? err : new Error('Failed to load actor details')
    console.error('Failed to load actor:', err)
  } finally {
    loading.value = false
  }
}

async function loadAssignments() {
  if (!actorGuid) return

  loadingAssignments.value = true
  try {
    // Get assignment GUIDs for this actor
    const assignmentGuids = await api.actor.getAllAssignments(actorGuid)
    
    // Fetch full assignment details
    const loadedAssignments = await Promise.allSettled(
      assignmentGuids.map((guid: string) => api.assignment.getAssignment(guid))
    )

    // Filter successful results
    assignments.value = loadedAssignments
      .filter((result): result is PromiseFulfilledResult<AssignmentDto> => result.status === 'fulfilled')
      .map(result => result.value)
  } catch (err) {
    console.error('Failed to load assignments:', err)
    // Don't set error here, just log it - actor details are more important
  } finally {
    loadingAssignments.value = false
  }
}

function goBack() {
  // Non-admin users go back to their dashboard, admin goes to actors list
  if (isAdmin.value) {
    router.push('/users')
  } else {
    router.push('/my-work-steps')
  }
}

onMounted(() => {
  loadActorDetails()
})
</script>

<style scoped>
.actor-details-view {
  min-height: 100vh;
  background: var(--color-background);
  padding: var(--spacing-xl);
}

.view-container {
  max-width: 1200px;
  margin: 0 auto;
}

.btn--back {
  margin-bottom: var(--spacing-xl);
}

.loading-state,
.error-state {
  padding: var(--spacing-xl);
  text-align: center;
}

.error-state {
  color: var(--color-danger);
}

.actor-details {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.actor-header {
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-border);
}

.actor-header__info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.actor-header__info h1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

.badge--role {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.badge--no-role {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.badge--count {
  background: var(--color-secondary-light);
  color: var(--color-secondary-dark);
}

.assignments-section {
  margin-top: var(--spacing-2xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.empty-state {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-tertiary);
}

.assignments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
</style>

