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
  requiredRole: Role
  assignedTo?: string | string[] // Support single or multiple user assignments
}

export interface UpdateWorkStepRequest {
  title?: string
  description?: string
  duration?: number
  status?: TaskStatus
  assignedTo?: string | string[] // Support single or multiple user assignments
  manualPriority?: Priority
  completedAt?: string // ISO date string
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
  nickname: string
  roleGuid?: string
}

export interface CreateActorRequest {
  nickname: string
  roleGuid?: string
}

export interface UpdateActorNicknameRequest {
  nickname: string
}

export interface UpdateActorRoleRequest {
  roleGuid?: string
}

// Objective API Types (Backend uses "Objective" terminology)
export interface ObjectiveDto {
  guid: string
  displayName: string
  description?: string
}

export interface CreateObjectiveDtoRequest {
  displayName: string
  description?: string
}

export interface UpdateObjectiveDisplayNameRequest {
  displayName: string
}

export interface UpdateObjectiveDescriptionRequest {
  description?: string
}

// Assignment API Types (Backend uses "Assignment" for Work Steps)
export interface AssignmentDto {
  guid: string
  displayName: string
  description?: string
  startDate?: string // ISO date string
  deadlineDate?: string // ISO date string
  actorGuid?: string | string[] // Can be single or multiple
  requiredRole?: string
  priority?: number // 0=IMMEDIATE, 1=MEDIUM_TERM, 2=LONG_TERM
  assignmentStatus?: number // 0=PENDING, 1=IN_PROGRESS, 2=COMPLETED, 3=BLOCKED
}

export interface CreateAssignmentRequest {
  displayName: string
  description?: string
  startDate?: string // ISO date string
  deadlineDate?: string // ISO date string
  actorGuid?: string | string[] // Can be single or multiple
  requiredRole?: string
}

export interface UpdateAssignmentDisplayNameRequest {
  displayName: string
}

export interface UpdateAssignmentDescriptionRequest {
  description?: string
}

export interface UpdateAssignmentStartDateRequest {
  startDate?: string // ISO date string
}

export interface UpdateAssignmentDeadlineDateRequest {
  deadlineDate?: string // ISO date string
}

export interface UpdateAssignmentAssigneeRequest {
  assigneeGuid?: string | string[] // Can be single or multiple
}

export interface UpdateAssignmentPriorityRequest {
  priority?: number // 0=IMMEDIATE, 1=MEDIUM_TERM, 2=LONG_TERM
}

export interface UpdateAssignmentStatusRequest {
  assignmentStatus?: number // 0=PENDING, 1=IN_PROGRESS, 2=COMPLETED, 3=BLOCKED
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
