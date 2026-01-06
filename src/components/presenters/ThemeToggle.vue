<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :aria-label="theme.value === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
    :title="theme.value === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
  >
    <svg
      v-if="theme.value === 'light'"
      class="theme-icon theme-icon--sun"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
    <svg
      v-else
      class="theme-icon theme-icon--moon"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--color-text-inverse);
  backdrop-filter: blur(10px);
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05) rotate(15deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-icon {
  width: 20px;
  height: 20px;
  transition: transform var(--transition-base);
}

.theme-icon--sun {
  color: #fbbf24;
}

.theme-icon--moon {
  color: #e0e7ff;
}

.theme-toggle:hover .theme-icon {
  transform: rotate(180deg);
}

[data-theme="dark"] .theme-toggle {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(148, 163, 184, 0.3);
  color: var(--color-text-primary);
}

[data-theme="dark"] .theme-toggle:hover {
  background: rgba(51, 65, 85, 0.7);
  border-color: rgba(148, 163, 184, 0.5);
}
</style>

