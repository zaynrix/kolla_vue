import { computed, type ComputedRef } from 'vue'
import type { Objective } from '@/types/domain'
import { Priority } from '@/types/domain'

export function usePriority(objective: ComputedRef<Objective | null>) {
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

  const isUrgent = computed(() => {
    return calculatedPriority.value === Priority.SHORT_TERM
  })

  const hoursUntilDeadline = computed(() => {
    if (!objective.value) return null

    const now = new Date()
    const deadline = new Date(objective.value.deadline)
    return Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
  })

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

