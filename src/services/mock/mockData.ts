/**
 * Mock Data Service
 * Simulates backend data for prototyping
 * In production, this would be replaced by real API calls
 */

import type {
  Workflow,
  WorkStep,
  User,
  Notification,
} from '@/types/domain'
import { Role, TaskStatus, Priority } from '@/types/domain'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'alice',
    email: 'alice@example.com',
    role: Role.WORKFLOW_MANAGER,
    tenantId: 'tenant-1',
  },
  {
    id: 'user-2',
    username: 'bob',
    email: 'bob@example.com',
    role: Role.TEAM_MEMBER,
    tenantId: 'tenant-1',
    qualifications: ['development'],
  },
  {
    id: 'user-3',
    username: 'charlie',
    email: 'charlie@example.com',
    role: Role.TEAM_MEMBER,
    tenantId: 'tenant-1',
    qualifications: ['testing'],
  },
  {
    id: 'user-4',
    username: 'diana',
    email: 'diana@example.com',
    role: Role.TEAM_MEMBER,
    tenantId: 'tenant-1',
    qualifications: ['review'],
  },
]

// Mock Workflows
export const mockWorkflows: Workflow[] = [
  {
    id: 'workflow-1',
    name: 'Feature Development: User Authentication',
    description: 'Implement user authentication system',
    workSteps: [],
    objectives: [],
    createdBy: 'user-1',
    workflowManagerId: 'user-1',
    tenantId: 'tenant-1',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'workflow-2',
    name: 'Bug Fix: Payment Processing',
    description: 'Fix critical payment processing bug',
    workSteps: [],
    objectives: [],
    createdBy: 'user-1',
    workflowManagerId: 'user-1',
    tenantId: 'tenant-1',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now (urgent)
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
]

// Mock Work Steps
const now = new Date()
export const mockWorkSteps: WorkStep[] = [
  // Workflow 1 - Sequential steps
  {
    id: 'step-1-1',
    title: 'Design Authentication Flow',
    description: 'Create UML diagrams and user flow',
    duration: 4,
    status: TaskStatus.COMPLETED,
    priority: Priority.LONG_TERM,
    workflowId: 'workflow-1',
    sequenceNumber: 1,
    requiredRole: Role.TEAM_MEMBER,
    assignedTo: 'user-2',
    completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'step-1-2',
    title: 'Implement Login Component',
    description: 'Build Vue component for login',
    duration: 6,
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.MEDIUM_TERM,
    workflowId: 'workflow-1',
    sequenceNumber: 2,
    requiredRole: Role.TEAM_MEMBER,
    assignedTo: 'user-2',
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
  },
  {
    id: 'step-1-3',
    title: 'Write Unit Tests',
    description: 'Test authentication components',
    duration: 4,
    status: TaskStatus.PENDING,
    priority: Priority.MEDIUM_TERM,
    workflowId: 'workflow-1',
    sequenceNumber: 3,
    requiredRole: Role.TEAM_MEMBER,
    assignedTo: undefined,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'step-1-4',
    title: 'Code Review',
    description: 'Review authentication implementation',
    duration: 2,
    status: TaskStatus.PENDING,
    priority: Priority.MEDIUM_TERM,
    workflowId: 'workflow-1',
    sequenceNumber: 4,
    requiredRole: Role.TEAM_MEMBER,
    assignedTo: undefined,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
  // Workflow 2 - Urgent workflow
  {
    id: 'step-2-1',
    title: 'Identify Root Cause',
    description: 'Debug payment processing issue',
    duration: 3,
    status: TaskStatus.COMPLETED,
    priority: Priority.IMMEDIATE,
    workflowId: 'workflow-2',
    sequenceNumber: 1,
    requiredRole: Role.TEAM_MEMBER,
    assignedTo: 'user-3',
    completedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'step-2-2',
    title: 'Fix Payment Bug',
    description: 'Implement fix for payment processing',
    duration: 4,
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.IMMEDIATE,
    workflowId: 'workflow-2',
    sequenceNumber: 2,
    requiredRole: Role.TEAM_MEMBER,
    assignedTo: 'user-3',
    createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'step-2-3',
    title: 'Test Payment Fix',
    description: 'Verify payment processing works correctly',
    duration: 2,
    status: TaskStatus.PENDING,
    priority: Priority.IMMEDIATE,
    workflowId: 'workflow-2',
    sequenceNumber: 3,
    requiredRole: Role.TEAM_MEMBER,
    assignedTo: undefined,
    createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
  },
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    title: 'Work Step Completed',
    message: 'Work step "Design Authentication Flow" has been completed',
    type: 'SUCCESS',
    read: false,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    relatedEntityId: 'workflow-1',
    relatedEntityType: 'WORKFLOW',
    workflowId: 'workflow-1',
    workStepId: 'step-1-1',
  },
  {
    id: 'notif-2',
    userId: 'user-2',
    title: 'New Work Step Assigned',
    message: 'You have been assigned: "Implement Login Component"',
    type: 'INFO',
    read: false,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    relatedEntityId: 'step-1-2',
    relatedEntityType: 'WORKSTEP',
    workStepId: 'step-1-2',
  },
]

// Helper function to get mock data with delay (simulate API)
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Simulate API response delay
export const API_DELAY = 300 // ms

