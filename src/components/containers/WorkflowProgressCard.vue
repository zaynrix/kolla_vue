<!--
  WorkflowProgressCard - Container Component
  Shows workflow progress summary
-->
<template>
  <div class="progress-card">
    <div v-if="progress" class="progress-card__content">
      <div class="progress-stats">
        <div class="stat-item">
          <span class="stat-label">Completed</span>
          <span class="stat-value stat-value--success">
            {{ progress.completedSteps }}/{{ progress.totalSteps }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">In Progress</span>
          <span class="stat-value stat-value--info">
            {{ progress.inProgressSteps }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Pending</span>
          <span class="stat-value">
            {{ progress.pendingSteps }}
          </span>
        </div>
      </div>

      <div class="progress-bar">
        <div
          class="progress-bar__fill"
          :style="{ width: `${progress.completionPercentage}%` }"
          :class="{
            'progress-bar__fill--on-track': progress.isOnTrack,
            'progress-bar__fill--off-track': !progress.isOnTrack,
          }"
        ></div>
      </div>

      <div class="progress-info">
        <span class="progress-percentage">{{ Math.round(progress.completionPercentage) }}%</span>
        <span
          v-if="progress.deadline"
          class="progress-deadline"
          :class="{ 'progress-deadline--urgent': !progress.isOnTrack }"
        >
          Deadline: {{ formatDate(progress.deadline) }}
        </span>
      </div>

      <div v-if="progress.estimatedCompletionDate" class="progress-estimate">
        Est. completion: {{ formatDate(progress.estimatedCompletionDate) }}
      </div>
    </div>
    <div v-else class="progress-card__loading">
      Loading progress...
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkflowManager } from '@/composables/useWorkflowManager'

interface Props {
  workflowId: string
}

const props = defineProps<Props>()

const { getWorkflowProgress } = useWorkflowManager()

const progress = computed(() => {
  try {
    return getWorkflowProgress(props.workflowId)
  } catch {
    return null
  }
})

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.progress-card {
  background: #f9f9f9;
  border-radius: 4px;
  padding: 1rem;
}

.progress-card__loading {
  text-align: center;
  color: #888;
  padding: 1rem;
}

.progress-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.stat-value--success {
  color: #2e7d32;
}

.stat-value--info {
  color: #1565c0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar__fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s;
}

.progress-bar__fill--off-track {
  background: #f44336;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.progress-percentage {
  font-weight: 600;
  color: #333;
}

.progress-deadline {
  color: #666;
}

.progress-deadline--urgent {
  color: #f44336;
  font-weight: 600;
}

.progress-estimate {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #888;
  font-style: italic;
}
</style>








