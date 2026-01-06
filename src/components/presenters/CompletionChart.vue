<!--
  CompletionChart - Visual representation of work step completion
  Shows completion status breakdown with a clean, professional chart
-->
<template>
  <div class="completion-chart">
    <div class="chart-header">
      <h3 class="chart-title">Completion Status</h3>
      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-color" style="background-color: #16a34a;"></span>
          <span class="legend-label">Completed</span>
          <span class="legend-value">{{ completedCount }}</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #2563eb;"></span>
          <span class="legend-label">In Progress</span>
          <span class="legend-value">{{ inProgressCount }}</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #d97706;"></span>
          <span class="legend-label">Pending</span>
          <span class="legend-value">{{ pendingCount }}</span>
        </div>
      </div>
    </div>
    
    <div class="chart-container">
      <!-- Progress Bar Chart -->
      <div class="progress-chart">
        <div class="progress-bar">
          <div
            class="progress-segment progress-completed"
            :style="{ width: `${completedPercentage}%` }"
            :title="`Completed: ${completedCount}`"
          ></div>
          <div
            class="progress-segment progress-in-progress"
            :style="{ width: `${inProgressPercentage}%` }"
            :title="`In Progress: ${inProgressCount}`"
          ></div>
          <div
            class="progress-segment progress-pending"
            :style="{ width: `${pendingPercentage}%` }"
            :title="`Pending: ${pendingCount}`"
          ></div>
        </div>
        <div class="progress-labels">
          <span class="progress-label">{{ Math.round(completedPercentage) }}%</span>
        </div>
      </div>

      <!-- Donut Chart (SVG) -->
      <div class="donut-chart">
        <svg viewBox="0 0 120 120" class="donut-svg">
          <!-- Background circle -->
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e9ecef"
            stroke-width="12"
          />
          <!-- Completed segment -->
          <circle
            v-if="completedPercentage > 0"
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#16a34a"
            stroke-width="12"
            :stroke-dasharray="`${completedCircumference} ${totalCircumference}`"
            stroke-dashoffset="0"
            transform="rotate(-90 60 60)"
            class="donut-segment"
          />
          <!-- In Progress segment -->
          <circle
            v-if="inProgressPercentage > 0"
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#2563eb"
            stroke-width="12"
            :stroke-dasharray="`${inProgressCircumference} ${totalCircumference}`"
            :stroke-dashoffset="`-${completedCircumference}`"
            transform="rotate(-90 60 60)"
            class="donut-segment"
          />
          <!-- Pending segment -->
          <circle
            v-if="pendingPercentage > 0"
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#d97706"
            stroke-width="12"
            :stroke-dasharray="`${pendingCircumference} ${totalCircumference}`"
            :stroke-dashoffset="`-${completedCircumference + inProgressCircumference}`"
            transform="rotate(-90 60 60)"
            class="donut-segment"
          />
        </svg>
        <div class="donut-center">
          <div class="donut-percentage">{{ Math.round(completedPercentage) }}%</div>
          <div class="donut-label">Complete</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  total: number
  completed: number
  inProgress: number
  pending: number
}

const props = defineProps<Props>()

const completedCount = computed(() => props.completed)
const inProgressCount = computed(() => props.inProgress)
const pendingCount = computed(() => props.pending)

const totalCount = computed(() => props.total || 1) // Avoid division by zero

const completedPercentage = computed(() => {
  return (completedCount.value / totalCount.value) * 100
})

const inProgressPercentage = computed(() => {
  return (inProgressCount.value / totalCount.value) * 100
})

const pendingPercentage = computed(() => {
  return (pendingCount.value / totalCount.value) * 100
})

// SVG circle calculations (circumference = 2 * π * radius, radius = 50)
const totalCircumference = computed(() => 2 * Math.PI * 50)
const completedCircumference = computed(() => (completedPercentage.value / 100) * totalCircumference.value)
const inProgressCircumference = computed(() => (inProgressPercentage.value / 100) * totalCircumference.value)
const pendingCircumference = computed(() => (pendingPercentage.value / 100) * totalCircumference.value)
</script>

<style scoped>
.completion-chart {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.completion-chart:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

.chart-header {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-border-light);
}

.chart-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
  letter-spacing: -0.01em;
}

.chart-legend {
  display: flex;
  gap: var(--spacing-xl);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  cursor: default;
}

.legend-item:hover {
  background: var(--color-surface-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.legend-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
}

.legend-value {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin-left: var(--spacing-xs);
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  align-items: center;
  margin-top: var(--spacing-lg);
}

/* Progress Bar Chart */
.progress-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.progress-bar {
  width: 100%;
  height: 40px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-border-light);
}

.progress-segment {
  height: 100%;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-segment::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-completed {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
}

.progress-in-progress {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.progress-pending {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
}

.progress-labels {
  display: flex;
  justify-content: flex-end;
  padding-right: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.progress-label {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  background: var(--color-surface);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

/* Donut Chart */
.donut-chart {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto;
}

.donut-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.donut-segment {
  transition: stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: var(--color-surface);
  border-radius: 50%;
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  border: 2px solid var(--color-border-light);
}

.donut-percentage {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: 1.2;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.donut-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: var(--font-semibold);
  margin-top: var(--spacing-xs);
}

@media (max-width: 768px) {
  .chart-container {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .donut-chart {
    width: 150px;
    height: 150px;
  }

  .donut-center {
    width: 80px;
    height: 80px;
  }

  .donut-percentage {
    font-size: var(--text-2xl);
  }

  .chart-legend {
    gap: var(--spacing-md);
  }
}
</style>

