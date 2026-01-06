/**
 * usePriority Composable
 * ViewModel layer - Business logic for priority calculation
 * Implements priority logic: immediate (≤8h), medium-term (≤32h), long-term (>32h)
 */

import { computed, type ComputedRef } from 'vue'
import type { Objective } from '@/types/domain'
import { Priority } from '@/types/domain'

export function usePriority(objective: ComputedRef<Objective | null>) {
  /**
   * Calculate priority based on deadline and duration
   * Priority rules:
   * - IMMEDIATE: deadline is ≤8 hours away
   * - MEDIUM_TERM: deadline is ≤32 hours away
   * - LONG_TERM: deadline is >32 hours away
   */
  const calculatedPriority = computed<Priority>(() => {
    if (!objective.value) return Priority.LONG_TERM

    const now = new Date()
    const deadline = new Date(objective.value.deadline)
    const hoursUntilDeadline =
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilDeadline <= 8) {
      return Priority.SHORT_TERM // ShortTerm
    } else if (hoursUntilDeadline <= 32) {
      return Priority.MID_TERM // MidTerm
    } else {
      return Priority.LONG_TERM // LongTerm
    }
  })

  /**
   * Check if objective is urgent (short-term priority)
   */
  const isUrgent = computed(() => {
    return calculatedPriority.value === Priority.SHORT_TERM
  })

  /**
   * Get hours until deadline
   */
  const hoursUntilDeadline = computed(() => {
    if (!objective.value) return null

    const now = new Date()
    const deadline = new Date(objective.value.deadline)
    return Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
  })

  /**
   * Check if deadline is approaching (within 24 hours)
   */
  const isDeadlineApproaching = computed(() => {
    const hours = hoursUntilDeadline.value
    return hours !== null && hours <= 24 && hours > 0
  })

  return {
    calculatedPriority,
    isUrgent,
    hoursUntilDeadline,
    isDeadlineApproaching,
  }
}

