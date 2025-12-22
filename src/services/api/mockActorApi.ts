/**
 * Mock Actor API Service
 * Simulates backend Actor API for prototyping
 */

import { delay, API_DELAY, mockUsers, mockWorkSteps } from '../mock/mockData'
import type {
  ActorDto,
  CreateActorRequest,
  AssignmentDto,
} from '@/types/api'

// Mock actors storage (mapped from mockUsers)
const mockActors: ActorDto[] = mockUsers.map((user) => ({
  guid: user.id,
  nickname: user.username,
  roleGuid: user.role === 'WORKFLOW_MANAGER' ? 'role-1' : user.role === 'ADMIN' ? 'role-3' : 'role-2',
}))

export class MockActorApiService {
  async getAllActors(): Promise<string[]> {
    await delay(API_DELAY)
    return mockActors.map((a) => a.guid)
  }

  async getActor(guid: string): Promise<ActorDto> {
    await delay(API_DELAY)
    const actor = mockActors.find((a) => a.guid === guid)
    if (!actor) {
      throw new Error(`Actor ${guid} not found`)
    }
    return actor
  }

  async createActor(request: CreateActorRequest): Promise<string> {
    await delay(API_DELAY)
    const newActor: ActorDto = {
      guid: `actor-${Date.now()}`,
      nickname: request.nickname,
      roleGuid: request.roleGuid,
    }
    mockActors.push(newActor)
    return newActor.guid
  }

  async setActorNickname(actorGuid: string, nickname: string): Promise<void> {
    await delay(API_DELAY)
    const actor = mockActors.find((a) => a.guid === actorGuid)
    if (actor) {
      actor.nickname = nickname
    }
  }

  async setActorRole(actorGuid: string, roleGuid?: string): Promise<void> {
    await delay(API_DELAY)
    const actor = mockActors.find((a) => a.guid === actorGuid)
    if (actor) {
      actor.roleGuid = roleGuid
    }
  }

  async getAssignments(): Promise<AssignmentDto[]> {
    await delay(API_DELAY)
    // Map work steps to assignments
    const assignments: AssignmentDto[] = mockWorkSteps.map((step) => ({
      guid: step.id,
      displayName: step.title,
      description: step.description,
      deadlineDate: undefined, // Would come from workflow
      actorGuid: step.assignedTo,
      requiredRole: step.requiredRole,
      priority: step.priority === 'IMMEDIATE' ? 0 : step.priority === 'MEDIUM_TERM' ? 1 : 2,
      assignmentStatus: step.status === 'PENDING' ? 0 : step.status === 'IN_PROGRESS' ? 1 : step.status === 'COMPLETED' ? 2 : 3,
    }))
    
    return assignments
  }

  async deleteActor(guid: string): Promise<void> {
    await delay(API_DELAY)
    const index = mockActors.findIndex((a) => a.guid === guid)
    if (index !== -1) {
      mockActors.splice(index, 1)
    }
  }
}

