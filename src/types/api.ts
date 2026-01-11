/**
 * API DTOs - Data Transfer Objects for backend communication
 */

import type { Objective, TaskStatus, WorkStep, Priority, Role } from './domain'

export interface CreateObjectiveRequest {
  title: string
  description?: string
  deadline: string // ISO date string
  duration: number
  workflowId: string
  assignedTo?: string
}

export interface UpdateObjectiveRequest {
  title?: string
  description?: string
  deadline?: string
  duration?: number
  status?: TaskStatus
  assignedTo?: string
}

export interface CreateWorkStepRequest {
  title: string
  description?: string
  duration: number
  workflowId: string
  sequenceNumber: number
  requiredRole: Role // Keep for backward compatibility
  requiredRoleGuid?: string | null // Role GUID for Assignment API
  assignedTo?: string | string[] // Support single or multiple user assignments
  startDate?: string | null // ISO date string
  deadlineDate?: string | null // ISO date string
}

export interface UpdateWorkStepRequest {
  title?: string
  description?: string
  duration?: number
  status?: TaskStatus
  assignedTo?: string | string[] // Support single or multiple user assignments
  manualPriority?: Priority
  completedAt?: string // ISO date string
  startDate?: string | null // ISO date string
  deadlineDate?: string | null // ISO date string
}

export interface CreateWorkflowRequest {
  name: string
  description?: string
  deadline?: string // ISO date string
  workflowManagerId?: string
  tenantId?: string
}

// Role API Types
export interface RoleDto {
  guid: string
  displayName: string
  isAdmin: boolean
  description?: string
}

export interface CreateRoleRequest {
  displayName: string
  isAdmin: boolean
  description?: string
}

export interface UpdateRoleDisplayNameRequest {
  displayName: string
}

export interface UpdateRoleDescriptionRequest {
  description?: string
}

export interface UpdateRoleAdminFlagRequest {
  isAdmin: boolean
}

// Actor API Types
export interface ActorDto {
  guid: string
  displayName: string
  role?: RoleDto
}

export interface CreateActorRequest {
  DisplayName: string
  RoleGuid?: string
}

export interface UpdateActorDisplayNameRequest {
  DisplayName: string
}

export interface UpdateActorRoleRequest {
  Guid: string
  RoleGuid?: string | null
}

// Objective API Types (Backend uses "Objective" terminology)
export interface ObjectiveDto {
  guid: string
  displayName: string
  description?: string
  deadlineDate?: string | null // ISO date string (DateTime?)
}

export interface CreateObjectiveDtoRequest {
  displayName: string
  description?: string
  deadlineDate?: string | null // ISO date string (DateTime?)
}

export interface UpdateObjectiveDisplayNameRequest {
  displayName: string
}

export interface UpdateObjectiveDescriptionRequest {
  description?: string
}

export interface UpdateObjectiveDeadlineDateRequest {
  guid: string
  DeadlineDate?: string | null // ISO date string
}

// Assignment API Types (Backend uses "Assignment" for Work Steps)
// Matches the data model: Assignment has relationships to Objective, Actor, and Role
export interface AssignmentDto {
  guid: string
  displayName: string
  description?: string | null
  duration: number // Duration in hours
  sequenceNumber: number // Sequence number in workflow
  startDate?: string | null // ISO date string (DateTime?) - may not be in response
  endDate?: string | null // ISO date string (DateTime?) - automatically set when status=Completed
  deadlineDate?: string | null // ISO date string (DateTime?) - may not be in response
  assigneeGuid?: string | null // GUID of Actor assigned to this assignment (1 Actor -> many Assignments)
  requiredRoleGuid?: string | null // GUID of Role required for this assignment (1 Assignment -> 1 Role)
  priority: number // 0=ShortTerm, 1=MidTerm, 2=LongTerm (enum Priority)
  status: number // 0=Planned, 1=InProgress, 2=Completed (enum AssignmentStatus)
  parentObjectiveGuid?: string | null // GUID of parent Objective (1 Objective -> many Assignments)
}

export interface CreateAssignmentRequest {
  DisplayName: string
  Description?: string | null
  Duration: number // Duration in hours
  AssigneeGuid?: string | null
  RequiredRole?: string | null // Role GUID (named RequiredRole in API, but it's still a GUID)
  ParentObjectiveGuid?: string | null
}

export interface UpdateAssignmentDisplayNameRequest {
  displayName: string
}

export interface UpdateAssignmentDescriptionRequest {
  description?: string
}

export interface UpdateAssignmentDurationRequest {
  guid: string
  Duration: number // Duration in hours
}

export interface UpdateAssignmentStartDateRequest {
  guid: string
  StartDate?: string | null // ISO date string
}

export interface UpdateAssignmentDeadlineDateRequest {
  guid: string
  DeadlineDate?: string | null // ISO date string
}

export interface UpdateAssignmentAssigneeRequest {
  guid: string
  AssigneeGuid?: string | null
}

export interface UpdateAssignmentRequiredRoleRequest {
  guid: string
  RequiredRoleGuid?: string | null
}

export interface UpdateAssignmentPriorityRequest {
  guid: string
  priority: number // 0=ShortTerm, 1=MidTerm, 2=LongTerm
}

export interface UpdateAssignmentStatusRequest {
  guid: string
  assignmentStatus: number // 0=Planned, 1=InProgress, 2=Completed
}

export interface UpdateAssignmentParentObjectiveRequest {
  guid: string
  ParentObjectiveGuid?: string | null
}

export interface ApiResponse<T> {
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
