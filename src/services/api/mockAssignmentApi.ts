/**
 * Mock Assignment API Service
 * Simulates backend Assignment API for prototyping
 */

import { delay, API_DELAY, mockWorkSteps } from '../mock/mockData'
import type {
  AssignmentDto,
  CreateAssignmentRequest,
  ApiResponse,
} from '@/types/api'
import { TaskStatus, Priority } from '@/types/domain'

// Mock assignments storage (mapped from mockWorkSteps)
let mockAssignments: AssignmentDto[] = mockWorkSteps.map((step) => ({
  guid: step.id,
  displayName: step.title,
  description: step.description,
  startDate: step.createdAt.toISOString(),
  deadlineDate: undefined, // Would come from workflow
  actorGuid: step.assignedTo,
  requiredRole: step.requiredRole,
  priority: step.priority === 'IMMEDIATE' ? 0 : step.priority === 'MEDIUM_TERM' ? 1 : 2,
  assignmentStatus: step.status === 'PENDING' ? 0 : step.status === 'IN_PROGRESS' ? 1 : step.status === 'COMPLETED' ? 2 : 3,
}))

export class MockAssignmentApiService {
  async getAllAssignments(): Promise<ApiResponse<string[]>> {
    await delay(API_DELAY)
    return {
      data: mockAssignments.map((a) => a.guid),
    }
  }

  async getAssignment(guid: string): Promise<ApiResponse<AssignmentDto>> {
    await delay(API_DELAY)
    const assignment = mockAssignments.find((a) => a.guid === guid)
    if (!assignment) {
      throw new Error(`Assignment ${guid} not found`)
    }
    return { data: assignment }
  }

  async createAssignment(request: CreateAssignmentRequest): Promise<ApiResponse<string>> {
    await delay(API_DELAY)
    const newAssignment: AssignmentDto = {
      guid: `assignment-${Date.now()}`,
      displayName: request.displayName,
      description: request.description,
      startDate: request.startDate || new Date().toISOString(),
      deadlineDate: request.deadlineDate,
      actorGuid: request.actorGuid,
      requiredRole: request.requiredRole,
      priority: 2, // Default LONG_TERM
      assignmentStatus: 0, // Default PENDING
    }
    mockAssignments.push(newAssignment)
    return { data: newAssignment.guid }
  }

  async setAssignmentDisplayName(guid: string, displayName: string): Promise<ApiResponse<void>> {
    await delay(API_DELAY)
    const assignment = mockAssignments.find((a) => a.guid === guid)
    if (assignment) {
      assignment.displayName = displayName
    }
    return { data: undefined as any }
  }

  async setAssignmentDescription(guid: string, description?: string): Promise<ApiResponse<void>> {
    await delay(API_DELAY)
    const assignment = mockAssignments.find((a) => a.guid === guid)
    if (assignment) {
      assignment.description = description
    }
    return { data: undefined as any }
  }

  async setAssignmentStartDate(guid: string, startDate?: string): Promise<ApiResponse<void>> {
    await delay(API_DELAY)
    const assignment = mockAssignments.find((a) => a.guid === guid)
    if (assignment) {
      assignment.startDate = startDate
    }
    return { data: undefined as any }
  }

  async setAssignmentDeadlineDate(guid: string, deadlineDate?: string): Promise<ApiResponse<void>> {
    await delay(API_DELAY)
    const assignment = mockAssignments.find((a) => a.guid === guid)
    if (assignment) {
      assignment.deadlineDate = deadlineDate
    }
    return { data: undefined as any }
  }

  async setAssignmentAssignee(guid: string, assigneeGuid?: string | string[]): Promise<ApiResponse<void>> {
    await delay(API_DELAY)
    const assignment = mockAssignments.find((a) => a.guid === guid)
    if (assignment) {
      assignment.actorGuid = assigneeGuid
    }
    return { data: undefined as any }
  }

  async setAssignmentPriority(guid: string, priority?: number): Promise<ApiResponse<void>> {
    await delay(API_DELAY)
    const assignment = mockAssignments.find((a) => a.guid === guid)
    if (assignment) {
      assignment.priority = priority
    }
    return { data: undefined as any }
  }

  async setAssignmentStatus(guid: string, assignmentStatus?: number): Promise<ApiResponse<void>> {
    await delay(API_DELAY)
    const assignment = mockAssignments.find((a) => a.guid === guid)
    if (assignment) {
      assignment.assignmentStatus = assignmentStatus
    }
    return { data: undefined as any }
  }

  async deleteAssignment(guid: string): Promise<ApiResponse<void>> {
    await delay(API_DELAY)
    const index = mockAssignments.findIndex((a) => a.guid === guid)
    if (index !== -1) {
      mockAssignments.splice(index, 1)
    }
    return { data: undefined as any }
  }
}




