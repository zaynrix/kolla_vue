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

export function mapPriorityFromBackend(priority?: number): Priority {
  if (priority === undefined || priority === null) {
    return PriorityEnum.LONG_TERM
  }
  
  switch (priority) {
    case 0:
      return PriorityEnum.SHORT_TERM // ShortTerm
    case 1:
      return PriorityEnum.MID_TERM // MidTerm
    case 2:
      return PriorityEnum.LONG_TERM // LongTerm
    default:
      return PriorityEnum.LONG_TERM
  }
}

/**
 * Map frontend Priority enum to backend Priority number
 * Backend: 0=ShortTerm, 1=MidTerm, 2=LongTerm
 */
export function mapPriorityToBackend(priority: Priority): number {
  switch (priority) {
    case PriorityEnum.SHORT_TERM:
      return 0 // ShortTerm
    case PriorityEnum.MID_TERM:
      return 1 // MidTerm
    case PriorityEnum.LONG_TERM:
      return 2 // LongTerm
    default:
      return 2
  }
}

/**
 * Map backend AssignmentStatus number to frontend TaskStatus enum
 * Backend: 0=Planned, 1=InProgress, 2=Completed
 */
export function mapStatusFromBackend(status?: number): TaskStatus {
  if (status === undefined || status === null) {
    return TaskStatusEnum.PENDING // Default to PENDING (maps to Planned)
  }
  
  switch (status) {
    case 0:
      return TaskStatusEnum.PENDING // Planned
    case 1:
      return TaskStatusEnum.IN_PROGRESS // InProgress
    case 2:
      return TaskStatusEnum.COMPLETED // Completed
    case 3:
      return TaskStatusEnum.BLOCKED // Blocked (not in diagram, but kept for compatibility)
    default:
      return TaskStatusEnum.PENDING
  }
}

/**
 * Map frontend TaskStatus enum to backend AssignmentStatus number
 * Backend: 0=Planned, 1=InProgress, 2=Completed
 */
export function mapStatusToBackend(status: TaskStatus): number {
  switch (status) {
    case TaskStatusEnum.PENDING:
      return 0 // Planned
    case TaskStatusEnum.IN_PROGRESS:
      return 1 // InProgress
    case TaskStatusEnum.COMPLETED:
      return 2 // Completed
    case TaskStatusEnum.BLOCKED:
      return 0 // Blocked maps to Planned (or could be 3 if backend supports it)
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
  sequenceNumber?: number, // Optional: use from assignment if not provided
  requiredRole?: Role // Optional: may need to be fetched separately
): WorkStep {
  // Use duration from assignment, or calculate from dates if duration not available
  let duration = assignment.duration || 0
  
  // If duration is 0 but we have dates, calculate it
  if (duration === 0 && assignment.startDate && assignment.deadlineDate) {
    const startDate = new Date(assignment.startDate)
    const deadlineDate = new Date(assignment.deadlineDate)
    if (!isNaN(startDate.getTime()) && !isNaN(deadlineDate.getTime()) && deadlineDate > startDate) {
      const diffMs = deadlineDate.getTime() - startDate.getTime()
        duration = Math.round(diffMs / (1000 * 60 * 60)) // Convert to hours
    }
  }
  
  // Use sequenceNumber from assignment if available, otherwise use provided parameter
  const finalSequenceNumber = assignment.sequenceNumber ?? sequenceNumber ?? 1
  
  return {
    id: assignment.guid,
    title: assignment.displayName,
    description: assignment.description ? assignment.description : undefined,
    duration,
    status: mapStatusFromBackend(assignment.status),
    priority: mapPriorityFromBackend(assignment.priority),
    workflowId,
    sequenceNumber: finalSequenceNumber,
    requiredRole: requiredRole || RoleEnum.TEAM_MEMBER, // Default if not provided
    assignedTo: assignment.assigneeGuid
      ? Array.isArray(assignment.assigneeGuid)
        ? assignment.assigneeGuid
        : assignment.assigneeGuid
      : undefined,
    completedAt: assignment.status === 2 && assignment.endDate
      ? new Date(assignment.endDate)
      : undefined,
    createdAt: assignment.startDate ? new Date(assignment.startDate) : new Date(),
    updatedAt: new Date(),
    startDate: assignment.startDate ? new Date(assignment.startDate) : undefined,
    deadlineDate: assignment.deadlineDate ? new Date(assignment.deadlineDate) : undefined,
  }
}

/**
 * Map frontend WorkStep to backend AssignmentDto
 */
export function mapWorkStepToAssignment(workStep: WorkStep): Partial<AssignmentDto> {
  return {
    guid: workStep.id,
    displayName: workStep.title,
    description: workStep.description ?? null,
    deadlineDate: workStep.workflowId ? undefined : undefined, // Would need workflow deadline
    assigneeGuid: workStep.assignedTo 
      ? (Array.isArray(workStep.assignedTo) ? workStep.assignedTo[0] || null : workStep.assignedTo)
      : null,
    requiredRoleGuid: workStep.requiredRole,
    priority: mapPriorityToBackend(workStep.manualPriority || workStep.priority),
    status: mapStatusToBackend(workStep.status),
  }
}

/**
 * Map backend ActorDto to frontend User
 * Admin status is determined by the actor's role's isAdmin flag
 */
export function mapActorToUser(actor: ActorDto, role?: RoleDto): User {
  const roleDto = role || actor.role
  
  // Check if actor's role has isAdmin flag set to true
  const isAdmin = roleDto?.isAdmin === true
  
  // Determine user role based on actor's role
  let userRole: Role
  if (isAdmin) {
    userRole = RoleEnum.ADMIN
  } else if (roleDto?.displayName?.toLowerCase().includes('manager')) {
    userRole = RoleEnum.WORKFLOW_MANAGER
  } else {
    userRole = RoleEnum.TEAM_MEMBER
  }
  
  return {
    id: actor.guid,
    username: actor.displayName,
    email: `${actor.displayName}@example.com`, // Default, should come from backend
    role: userRole,
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






