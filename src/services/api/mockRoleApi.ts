/**
 * Mock Role API Service
 * Simulates backend Role API for prototyping
 */

import { delay, API_DELAY } from '../mock/mockData'
import type {
  RoleDto,
  CreateRoleRequest,
} from '@/types/api'

// Mock roles storage
const mockRoles: RoleDto[] = [
  {
    guid: 'role-1',
    displayName: 'Workflow Manager',
    isAdmin: false,
    description: 'Manages workflows and assignments',
  },
  {
    guid: 'role-2',
    displayName: 'Team Member',
    isAdmin: false,
    description: 'Executes work steps',
  },
  {
    guid: 'role-3',
    displayName: 'Admin',
    isAdmin: true,
    description: 'System administrator',
  },
]

export class MockRoleApiService {
  async getAllRoles(): Promise<string[]> {
    await delay(API_DELAY)
    return mockRoles.map((r) => r.guid)
  }

  async getRole(guid: string): Promise<RoleDto> {
    await delay(API_DELAY)
    const role = mockRoles.find((r) => r.guid === guid)
    if (!role) {
      throw new Error(`Role ${guid} not found`)
    }
    return role
  }

  async createRole(request: CreateRoleRequest): Promise<string> {
    await delay(API_DELAY)
    const newRole: RoleDto = {
      guid: `role-${Date.now()}`,
      displayName: request.displayName,
      isAdmin: request.isAdmin,
      description: request.description,
    }
    mockRoles.push(newRole)
    return newRole.guid
  }

  async setRoleDisplayName(guid: string, displayName: string): Promise<void> {
    await delay(API_DELAY)
    const role = mockRoles.find((r) => r.guid === guid)
    if (role) {
      role.displayName = displayName
    }
  }

  async setRoleDescription(guid: string, description?: string): Promise<void> {
    await delay(API_DELAY)
    const role = mockRoles.find((r) => r.guid === guid)
    if (role) {
      role.description = description
    }
  }

  async setRoleAdminFlag(guid: string, isAdmin: boolean): Promise<void> {
    await delay(API_DELAY)
    const role = mockRoles.find((r) => r.guid === guid)
    if (role) {
      role.isAdmin = isAdmin
    }
  }

  async deleteRole(guid: string): Promise<void> {
    await delay(API_DELAY)
    const index = mockRoles.findIndex((r) => r.guid === guid)
    if (index !== -1) {
      mockRoles.splice(index, 1)
    }
  }
}

