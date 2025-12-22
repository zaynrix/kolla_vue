/**
 * Domain Models - Core business entities
 * No UI or technical dependencies for high testability
 */

export enum Priority {
  IMMEDIATE = 'IMMEDIATE', // ≤8h
  MEDIUM_TERM = 'MEDIUM_TERM', // ≤32h
  LONG_TERM = 'LONG_TERM', // >32h
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
}

export enum Role {
  WORKFLOW_MANAGER = 'WORKFLOW_MANAGER',
  TEAM_MEMBER = 'TEAM_MEMBER',
  ADMIN = 'ADMIN',
}

/**
 * WorkStep (Arbeitsschritt) - Represents a single step in a sequential workflow
 * Each work step has exactly one role and can be assigned to multiple actors
 */
export interface WorkStep {
  id: string
  title: string
  description?: string
  duration: number // in hours
  status: TaskStatus
  priority: Priority
  workflowId: string
  sequenceNumber: number // Order in sequential workflow (1, 2, 3, ...)
  requiredRole: Role // Exactly one role required for this step
  assignedTo?: string | string[] // User ID(s) of assigned actor(s) - supports single or multiple assignments
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  // Manual priority override by workflow manager
  manualPriority?: Priority
}

/**
 * Objective - Legacy name, kept for compatibility
 * In Kolla context, this represents a work step
 * @deprecated Use WorkStep instead
 */
export interface Objective {
  id: string
  title: string
  description?: string
  deadline: Date
  duration: number // in hours
  status: TaskStatus
  priority: Priority
  workflowId: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Sequential Workflow - Kolla workflow with ordered work steps
 * Steps are executed sequentially, automatically assigned to next actor
 */
export interface Workflow {
  id: string
  name: string
  description?: string
  workSteps: WorkStep[] // Sequential work steps
  objectives: Objective[] // Legacy support
  createdBy: string
  workflowManagerId: string // User ID of workflow manager
  tenantId?: string // Multi-tenancy support
  deadline?: Date // Overall workflow deadline
  completionDate?: Date // Actual completion date
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  username: string
  email: string
  role: Role
  tenantId?: string // Multi-tenancy support
  qualifications?: string[] // Qualifications for role-based assignment
}

/**
 * Actor - Can be a User or System (for future extensibility)
 */
export type Actor = User | SystemActor

export interface SystemActor {
  id: string
  name: string
  type: 'SYSTEM'
  capabilities: string[]
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  read: boolean
  createdAt: Date
  relatedEntityId?: string
  relatedEntityType?: 'WORKFLOW' | 'WORKSTEP' | 'OBJECTIVE' | 'TASK'
  // Workflow manager specific notifications
  workflowId?: string
  workStepId?: string
}

/**
 * Workflow Progress - For workflow manager deadline tracking
 */
export interface WorkflowProgress {
  workflowId: string
  totalSteps: number
  completedSteps: number
  pendingSteps: number
  inProgressSteps: number
  completionPercentage: number
  estimatedCompletionDate?: Date
  deadline?: Date
  isOnTrack: boolean
}

