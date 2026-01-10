export enum Priority {
  SHORT_TERM = 'ShortTerm', // ShortTerm
  MID_TERM = 'MidTerm', // MidTerm
  LONG_TERM = 'LongTerm', // LongTerm
}

export enum AssignmentStatus {
  PLANNED = 'Planned',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
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

export interface WorkStep {
  id: string
  title: string
  description?: string
  duration: number
  status: TaskStatus
  priority: Priority
  workflowId: string
  sequenceNumber: number
  requiredRole: Role
  assignedTo?: string | string[]
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  startDate?: Date // Start date for the assignment
  deadlineDate?: Date // Deadline date for the assignment
  manualPriority?: Priority
}

export interface Objective {
  id: string
  title: string
  description?: string
  deadline: Date
  duration: number
  status: TaskStatus
  priority: Priority
  workflowId: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

export interface Workflow {
  id: string
  name: string
  description?: string
  workSteps: WorkStep[]
  objectives: Objective[]
  createdBy: string
  workflowManagerId: string
  tenantId?: string
  deadline?: Date
  completionDate?: Date
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
  workflowId?: string
  workStepId?: string
}

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

