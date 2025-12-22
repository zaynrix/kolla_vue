/**
 * Actor API Service
 * Handles all actor-related API calls
 */

import type { ApiClient } from './client'
import type {
  ActorDto,
  CreateActorRequest,
  UpdateActorNicknameRequest,
  UpdateActorRoleRequest,
  ApiResponse,
  PaginatedResponse,
  AssignmentDto,
} from '@/types/api'

export class ActorApiService {
  constructor(private apiClient: ApiClient) {}

  async getAllActors(): Promise<string[]> {
    const response = await this.apiClient.get<ApiResponse<string[]>>('/Actor/GetAllActors')
    return response.data
  }

  async getActor(guid: string): Promise<ActorDto> {
    const response = await this.apiClient.get<ApiResponse<ActorDto>>(`/Actor/GetActor/${guid}`)
    return response.data
  }

  async createActor(request: CreateActorRequest): Promise<string> {
    const response = await this.apiClient.post<ApiResponse<string>>('/Actor/CreateActor', {
      Nickname: request.nickname,
      RoleGuid: request.roleGuid,
    })
    return response.data
  }

  async setActorNickname(actorGuid: string, nickname: string): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Actor/SetActorNickname/${actorGuid}`, {
      Nickname: nickname,
    })
  }

  async setActorRole(actorGuid: string, roleGuid?: string): Promise<void> {
    await this.apiClient.patch<ApiResponse<void>>(`/Actor/SetActorRole/${actorGuid}`, {
      RoleGuid: roleGuid,
    })
  }

  async getAssignments(): Promise<AssignmentDto[]> {
    const response = await this.apiClient.get<ApiResponse<PaginatedResponse<AssignmentDto>>>(
      '/Actor/GetAssignments'
    )
    return response.data.data
  }

  async deleteActor(guid: string): Promise<void> {
    await this.apiClient.delete<ApiResponse<void>>(`/Actor/DeleteActor/${guid}`)
  }
}



