<!--
  PriorityChart - Visual representation of work step priority distribution
  Shows priority breakdown with a modern, professional bar chart
-->
<template>
  <div class="priority-chart">
    <div class="chart-header">
      <h3 class="chart-title">Priority Distribution</h3>
      <div class="chart-subtitle">Breakdown by priority level</div>
    </div>
    
    <div class="chart-content">
      <div class="priority-bars">
        <div
          v-for="(item, index) in priorityData"
          :key="item.priority"
          class="priority-bar-item"
        >
          <div class="bar-label-row">
            <span class="bar-label">{{ item.label }}</span>
            <span class="bar-value">{{ item.count }}</span>
          </div>
          <div class="bar-container">
            <div
              class="bar-fill"
              :class="`bar-fill--${item.priority}`"
              :style="{ width: `${item.percentage}%` }"
            >
              <span class="bar-percentage">{{ Math.round(item.percentage) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Visual bars with icons -->
      <div class="priority-visual">
        <div
          v-for="item in priorityData"
          :key="item.priority"
          class="priority-visual-item"
          :class="`priority-visual-item--${item.priority}`"
        >
          <div class="visual-bar-wrapper">
            <div
              class="visual-bar"
              :style="{ height: `${item.percentage}%` }"
            ></div>
          </div>
          <div class="visual-label">
            <div class="visual-label-text">{{ item.label }}</div>
            <div class="visual-label-count">{{ item.count }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface PriorityItem {
  priority: string
  label: string
  count: number
  percentage: number
}

interface Props {
  shortTerm: number
  midTerm: number
  longTerm: number
}

const props = defineProps<Props>()

const total = computed(() => props.shortTerm + props.midTerm + props.longTerm || 1)

const priorityData = computed<PriorityItem[]>(() => {
  return [
    {
      priority: 'short-term',
      label: 'Short Term',
      count: props.shortTerm,
      percentage: (props.shortTerm / total.value) * 100,
    },
    {
      priority: 'mid-term',
      label: 'Mid Term',
      count: props.midTerm,
      percentage: (props.midTerm / total.value) * 100,
    },
    {
      priority: 'long-term',
      label: 'Long Term',
      count: props.longTerm,
      percentage: (props.longTerm / total.value) * 100,
    },
  ].filter(item => item.count > 0) // Only show priorities that have items
})
</script>

<style scoped>
.priority-chart {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.priority-chart:hover {
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
  margin: 0 0 var(--spacing-xs) 0;
  letter-spacing: -0.01em;
}

.chart-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
}

.chart-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  align-items: start;
  margin-top: var(--spacing-lg);
}

/* Horizontal Bar Chart */
.priority-bars {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.priority-bar-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-base);
}

.priority-bar-item:hover {
  background: var(--color-surface-hover);
  box-shadow: var(--shadow-sm);
  transform: translateX(4px);
}

.bar-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bar-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bar-value {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  background: var(--color-background);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  min-width: 40px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.bar-container {
  width: 100%;
  height: 36px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-border-light);
}

.bar-fill {
  height: 100%;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: var(--spacing-sm);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

.bar-fill--short-term {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.bar-fill--mid-term {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.bar-fill--long-term {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.bar-percentage {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

/* Vertical Bar Chart */
.priority-visual {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: var(--spacing-md);
  height: 240px;
  padding: var(--spacing-md) var(--spacing-sm);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  position: relative;
}

.priority-visual::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-border);
  opacity: 0.3;
}

.priority-visual-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  max-width: 100px;
  transition: all var(--transition-base);
  cursor: default;
}

.priority-visual-item:hover {
  transform: translateY(-4px);
}

.visual-bar-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  position: relative;
  padding-bottom: var(--spacing-lg);
}

.visual-bar {
  width: 100%;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 24px;
  overflow: hidden;
}

.visual-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent);
}

.priority-visual-item--short-term .visual-bar {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.priority-visual-item--mid-term .visual-bar {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.priority-visual-item--long-term .visual-bar {
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.visual-label {
  text-align: center;
  width: 100%;
  padding: var(--spacing-sm);
  background: var(--color-background);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.visual-label-text {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.visual-label-count {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: 1.2;
}

@media (max-width: 768px) {
  .chart-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .priority-visual {
    height: 180px;
  }

  .visual-label-text {
    font-size: 0.625rem;
  }

  .visual-label-count {
    font-size: var(--text-lg);
  }

  .bar-container {
    height: 32px;
  }
}
</style>

