/**
 * API Mappers
 * Maps between Backend DTOs and Frontend Domain Models
 */

import type {
  AssignmentDto,
  ActorDto,
  RoleDto,
  ObjectiveDto,
} from '@/types/api'
import type {
  WorkStep,
  User,
  Role,
  TaskStatus,
  Priority,
  Workflow,
} from '@/types/domain'
import { Priority as PriorityEnum, TaskStatus as TaskStatusEnum, Role as RoleEnum } from '@/types/domain'

/**
 * Map backend Priority number to frontend Priority enum
 */
export function mapPriorityFromBackend(priority?: number): Priority {
  if (priority === undefined || priority === null) {
    return PriorityEnum.LONG_TERM
  }
  
  switch (priority) {
    case 0:
      return PriorityEnum.IMMEDIATE
    case 1:
      return PriorityEnum.MEDIUM_TERM
    case 2:
      return PriorityEnum.LONG_TERM
    default:
      return PriorityEnum.LONG_TERM
  }
}

/**
 * Map frontend Priority enum to backend Priority number
 */
export function mapPriorityToBackend(priority: Priority): number {
  switch (priority) {
    case PriorityEnum.IMMEDIATE:
      return 0
    case PriorityEnum.MEDIUM_TERM:
      return 1
    case PriorityEnum.LONG_TERM:
      return 2
    default:
      return 2
  }
}

/**
 * Map backend AssignmentStatus number to frontend TaskStatus enum
 */
export function mapStatusFromBackend(status?: number): TaskStatus {
  if (status === undefined || status === null) {
    return TaskStatusEnum.PENDING
  }
  
  switch (status) {
    case 0:
      return TaskStatusEnum.PENDING
    case 1:
      return TaskStatusEnum.IN_PROGRESS
    case 2:
      return TaskStatusEnum.COMPLETED
    case 3:
      return TaskStatusEnum.BLOCKED
    default:
      return TaskStatusEnum.PENDING
  }
}

/**
 * Map frontend TaskStatus enum to backend AssignmentStatus number
 */
export function mapStatusToBackend(status: TaskStatus): number {
  switch (status) {
    case TaskStatusEnum.PENDING:
      return 0
    case TaskStatusEnum.IN_PROGRESS:
      return 1
    case TaskStatusEnum.COMPLETED:
      return 2
    case TaskStatusEnum.BLOCKED:
      return 3
    default:
      return 0
  }
}

/**
 * Map backend AssignmentDto to frontend WorkStep
 */
export function mapAssignmentToWorkStep(
  assignment: AssignmentDto,
  workflowId: string,
  sequenceNumber: number,
  requiredRole: Role
): WorkStep {
  return {
    id: assignment.guid,
    title: assignment.displayName,
    description: assignment.description,
    duration: 8, // Default, should be calculated or provided
    status: mapStatusFromBackend(assignment.assignmentStatus),
    priority: mapPriorityFromBackend(assignment.priority),
    workflowId,
    sequenceNumber,
    requiredRole,
    assignedTo: assignment.actorGuid
      ? Array.isArray(assignment.actorGuid)
        ? assignment.actorGuid
        : assignment.actorGuid
      : undefined,
    completedAt: assignment.assignmentStatus === 2 && assignment.deadlineDate
      ? new Date(assignment.deadlineDate)
      : undefined,
    createdAt: assignment.startDate ? new Date(assignment.startDate) : new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Map frontend WorkStep to backend AssignmentDto
 */
export function mapWorkStepToAssignment(workStep: WorkStep): Partial<AssignmentDto> {
  return {
    guid: workStep.id,
    displayName: workStep.title,
    description: workStep.description,
    deadlineDate: workStep.workflowId ? undefined : undefined, // Would need workflow deadline
    actorGuid: workStep.assignedTo,
    requiredRole: workStep.requiredRole,
    priority: mapPriorityToBackend(workStep.manualPriority || workStep.priority),
    assignmentStatus: mapStatusToBackend(workStep.status),
  }
}

/**
 * Map backend ActorDto to frontend User
 */
export function mapActorToUser(actor: ActorDto, role?: RoleDto): User {
  return {
    id: actor.guid,
    username: actor.nickname,
    email: `${actor.nickname}@example.com`, // Default, should come from backend
    role: role?.isAdmin ? RoleEnum.ADMIN : RoleEnum.TEAM_MEMBER, // Map based on role
    tenantId: undefined, // Should come from backend
  }
}

/**
 * Map backend RoleDto to frontend Role enum
 */
export function mapRoleDtoToRole(roleDto: RoleDto): Role {
  if (roleDto.isAdmin) {
    return RoleEnum.ADMIN
  }
  // Map based on displayName or other logic
  if (roleDto.displayName.toLowerCase().includes('manager')) {
    return RoleEnum.WORKFLOW_MANAGER
  }
  return RoleEnum.TEAM_MEMBER
}



