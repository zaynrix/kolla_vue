/**
 * Mock Workflow API Service
 * Uses MockApiClient for prototyping
 */

import { MockApiClient } from './mockApiClient'
import type { Workflow } from '@/types/domain'
import type { CreateWorkflowRequest } from '@/types/api'

export class MockWorkflowApiService {
  constructor(private mockClient: MockApiClient) {}

  async getAllWorkflows(): Promise<Workflow[]> {
    const response = await this.mockClient.getAllWorkflows()
    return response.data.data
  }

  async getWorkflowById(id: string): Promise<Workflow> {
    const response = await this.mockClient.getWorkflowById(id)
    return response.data
  }

  async createWorkflow(request: CreateWorkflowRequest): Promise<Workflow> {
    const response = await this.mockClient.createWorkflow(request)
    return response.data
  }

  async updateWorkflow(id: string, request: Partial<CreateWorkflowRequest>): Promise<Workflow> {
    const response = await this.mockClient.updateWorkflow(id, request)
    return response.data
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.mockClient.deleteWorkflow(id)
  }
}



