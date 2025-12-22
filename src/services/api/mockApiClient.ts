/**
 * Mock API Client
 * Simulates backend API for prototyping
 * Returns mock data with simulated delay
 */

import { delay, API_DELAY, mockUsers, mockWorkflows, mockWorkSteps, mockNotifications } from '../mock/mockData'
import type { Workflow, WorkStep, User, Notification } from '@/types/domain'
import { TaskStatus, Priority } from '@/types/domain'
import type {
  CreateWorkflowRequest,
  CreateWorkStepRequest,
  UpdateWorkStepRequest,
  ApiResponse,
  PaginatedResponse,
} from '@/types/api'

export class MockApiClient {
  // Workflows
  async getAllWorkflows(): Promise<ApiResponse<PaginatedResponse<Workflow>>> {
    await delay(API_DELAY)
    return {
      data: {
        data: mockWorkflows.map((wf) => ({
          ...wf,
          workSteps: mockWorkSteps.filter((ws) => ws.workflowId === wf.id),
        })),
        total: mockWorkflows.length,
        page: 1,
        pageSize: 10,
      },
    }
  }

  async getWorkflowById(id: string): Promise<ApiResponse<Workflow>> {
    await delay(API_DELAY)
    const workflow = mockWorkflows.find((w) => w.id === id)
    if (!workflow) {
      throw new Error(`Workflow ${id} not found`)
    }
    return {
      data: {
        ...workflow,
        workSteps: mockWorkSteps.filter((ws) => ws.workflowId === id),
      },
    }
  }

  async createWorkflow(request: CreateWorkflowRequest): Promise<ApiResponse<Workflow>> {
    await delay(API_DELAY)
    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: request.name,
      description: request.description,
      workSteps: [],
      objectives: [],
      createdBy: request.workflowManagerId || 'user-1',
      workflowManagerId: request.workflowManagerId || 'user-1',
      tenantId: request.tenantId || 'tenant-1',
      deadline: request.deadline ? new Date(request.deadline) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockWorkflows.push(newWorkflow)
    return { data: newWorkflow }
  }

  async updateWorkflow(id: string, request: Partial<CreateWorkflowRequest>): Promise<ApiResponse<Workflow>> {
    await delay(API_DELAY)
    const index = mockWorkflows.findIndex((w) => w.id === id)
    if (index === -1) {
      throw new Error(`Workflow ${id} not found`)
    }
    const updated: Workflow = {
      ...mockWorkflows[index],
      ...request,
      updatedAt: new Date(),
    } as Workflow
    mockWorkflows[index] = updated
    return { data: updated }
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    await delay(API_DELAY)
    const index = mockWorkflows.findIndex((w) => w.id === id)
    if (index !== -1) {
      mockWorkflows.splice(index, 1)
    }
    return { data: undefined as any }
  }

  // Work Steps
  async getAllWorkSteps(): Promise<ApiResponse<PaginatedResponse<WorkStep>>> {
    await delay(API_DELAY)
    return {
      data: {
        data: mockWorkSteps,
        total: mockWorkSteps.length,
        page: 1,
        pageSize: 10,
      },
    }
  }

  async getWorkStepById(id: string): Promise<ApiResponse<WorkStep>> {
    await delay(API_DELAY)
    const workStep = mockWorkSteps.find((ws) => ws.id === id)
    if (!workStep) {
      throw new Error(`WorkStep ${id} not found`)
    }
    return { data: workStep }
  }

  async getWorkStepsByWorkflow(workflowId: string): Promise<ApiResponse<PaginatedResponse<WorkStep>>> {
    await delay(API_DELAY)
    const steps = mockWorkSteps.filter((ws) => ws.workflowId === workflowId)
    return {
      data: {
        data: steps,
        total: steps.length,
        page: 1,
        pageSize: 10,
      },
    }
  }

  async getAssignedWorkSteps(userId: string): Promise<ApiResponse<PaginatedResponse<WorkStep>>> {
    await delay(API_DELAY)
    const steps = mockWorkSteps.filter((ws) => {
      if (!ws.assignedTo) return false
      if (Array.isArray(ws.assignedTo)) {
        return ws.assignedTo.includes(userId)
      }
      return ws.assignedTo === userId
    })
    return {
      data: {
        data: steps,
        total: steps.length,
        page: 1,
        pageSize: 10,
      },
    }
  }

  async createWorkStep(request: CreateWorkStepRequest): Promise<ApiResponse<WorkStep>> {
    await delay(API_DELAY)
    const { TaskStatus, Priority } = await import('@/types/domain')
    const newWorkStep: WorkStep = {
      id: `step-${Date.now()}`,
      title: request.title,
      description: request.description,
      duration: request.duration,
      status: TaskStatus.PENDING,
      priority: Priority.LONG_TERM,
      workflowId: request.workflowId,
      sequenceNumber: request.sequenceNumber,
      requiredRole: request.requiredRole,
      assignedTo: request.assignedTo, // Can be string, string[], or undefined
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockWorkSteps.push(newWorkStep)
    return { data: newWorkStep }
  }

  async updateWorkStep(id: string, request: UpdateWorkStepRequest): Promise<ApiResponse<WorkStep>> {
    await delay(API_DELAY)
    const index = mockWorkSteps.findIndex((ws) => ws.id === id)
    if (index === -1) {
      throw new Error(`WorkStep ${id} not found`)
    }
    
    const currentStep = mockWorkSteps[index]
    if (!currentStep) {
      throw new Error(`WorkStep ${id} not found`)
    }
    
    const updated: WorkStep = {
      ...currentStep,
      ...request,
      updatedAt: new Date(),
    } as WorkStep
    
    if (request.completedAt) {
      updated.completedAt = new Date(request.completedAt)
    }
    
    mockWorkSteps[index] = updated
    
    // Simulate automatic assignment of next step
    if (request.status === TaskStatus.COMPLETED && currentStep.sequenceNumber) {
      const workflowId = currentStep.workflowId
      const nextSequence = currentStep.sequenceNumber + 1
      const nextStep = mockWorkSteps.find(
        (ws) => ws.workflowId === workflowId && ws.sequenceNumber === nextSequence
      )
      if (nextStep && !nextStep.assignedTo) {
        // Auto-assign to first available user with required role
        const availableUser = mockUsers.find((u) => u.role === nextStep.requiredRole)
        if (availableUser) {
          nextStep.assignedTo = availableUser.id
          nextStep.updatedAt = new Date()
        }
      }
    }
    
    return { data: updated }
  }

  async assignWorkStep(workStepId: string, userId: string): Promise<ApiResponse<WorkStep>> {
    await delay(API_DELAY)
    const index = mockWorkSteps.findIndex((ws) => ws.id === workStepId)
    if (index === -1) {
      throw new Error(`WorkStep ${workStepId} not found`)
    }
    const workStep = mockWorkSteps[index]
    if (!workStep) {
      throw new Error(`WorkStep ${workStepId} not found`)
    }
    workStep.assignedTo = userId
    workStep.updatedAt = new Date()
    return { data: workStep }
  }

  async getAvailableActors(requiredRole: string): Promise<ApiResponse<PaginatedResponse<User>>> {
    await delay(API_DELAY)
    const users = mockUsers.filter((u) => u.role === requiredRole)
    return {
      data: {
        data: users,
        total: users.length,
        page: 1,
        pageSize: 10,
      },
    }
  }

  async deleteWorkStep(id: string): Promise<ApiResponse<void>> {
    await delay(API_DELAY)
    const index = mockWorkSteps.findIndex((ws) => ws.id === id)
    if (index !== -1) {
      mockWorkSteps.splice(index, 1)
    }
    return { data: undefined as any }
  }
}

