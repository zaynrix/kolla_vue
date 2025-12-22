/**
 * Mock WorkStep API Service
 * Uses MockApiClient for prototyping
 */

import { MockApiClient } from './mockApiClient'
import type { WorkStep, User } from '@/types/domain'
import type {
  CreateWorkStepRequest,
  UpdateWorkStepRequest,
} from '@/types/api'

export class MockWorkStepApiService {
  constructor(private mockClient: MockApiClient) {}

  async getAllWorkSteps(): Promise<WorkStep[]> {
    const response = await this.mockClient.getAllWorkSteps()
    return response.data.data
  }

  async getWorkStepById(id: string): Promise<WorkStep> {
    const response = await this.mockClient.getWorkStepById(id)
    return response.data
  }

  async getWorkStepsByWorkflow(workflowId: string): Promise<WorkStep[]> {
    const response = await this.mockClient.getWorkStepsByWorkflow(workflowId)
    return response.data.data
  }

  async getAssignedWorkSteps(userId: string): Promise<WorkStep[]> {
    const response = await this.mockClient.getAssignedWorkSteps(userId)
    return response.data.data
  }

  async createWorkStep(request: CreateWorkStepRequest): Promise<WorkStep> {
    const response = await this.mockClient.createWorkStep(request)
    return response.data
  }

  async updateWorkStep(id: string, request: UpdateWorkStepRequest): Promise<WorkStep> {
    const response = await this.mockClient.updateWorkStep(id, request)
    return response.data
  }

  async assignWorkStep(workStepId: string, userId: string): Promise<WorkStep> {
    const response = await this.mockClient.assignWorkStep(workStepId, userId)
    return response.data
  }

  async getAvailableActors(requiredRole: string): Promise<User[]> {
    const response = await this.mockClient.getAvailableActors(requiredRole)
    return response.data.data
  }

  async deleteWorkStep(id: string): Promise<void> {
    await this.mockClient.deleteWorkStep(id)
  }
}



